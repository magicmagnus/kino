import json
from pathlib import Path
from rapidfuzz import fuzz
from rapidfuzz import process as rf_process
from sentence_transformers import SentenceTransformer, util

# ------------------------
# Preprocessing
# ------------------------
import re

STOPWORDS = {"der", "die", "das", "the", "of", "und", "und", "ein", "eine"}


def normalize_title(title: str) -> str:
    """Lowercase, remove punctuation, years, stopwords, expand abbreviations."""
    title = title.lower()
    # Remove year annotations like (2025) or [2025]
    title = re.sub(r"\(\d{4}\)|\[\d{4}\]", "", title)
    # Remove punctuation and dashes
    title = re.sub(r"[-:()|]", " ", title)
    # Expand common abbreviation "d." -> "der"
    # title = re.sub(r"\bd\.\b", "der", title)
    # Remove multiple spaces
    title = re.sub(r"\s+", " ", title).strip()
    return title


def tokenize_title(title: str):
    return [w for w in title.split() if w not in STOPWORDS]


# ------------------------
# Similarity Components
# ------------------------
def string_similarity(t1, t2) -> float:
    """Character-based similarity (normalized Levenshtein)."""
    return fuzz.token_sort_ratio(t1, t2) / 100.0


def token_similarity(tokens1, tokens2) -> float:
    """Simple Jaccard overlap on tokens."""
    set1, set2 = set(tokens1), set(tokens2)
    if not set1 or not set2:
        return 0.0
    return len(set1 & set2) / len(set1 | set2)


def containment_similarity(tokens1, tokens2) -> float:
    """Returns 1.0 if smaller set is fully contained in larger set."""
    set1, set2 = set(tokens1), set(tokens2)
    if not set1 or not set2:
        return 0.0

    smaller, larger = (set1, set2) if len(set1) <= len(set2) else (set2, set1)
    return len(smaller & larger) / len(smaller)


def embedding_similarity(t1, t2, model) -> float:
    """Cosine similarity on sentence embeddings."""
    emb1, emb2 = model.encode([t1, t2], convert_to_tensor=True)
    return float(util.cos_sim(emb1, emb2))


def prefix_boost(t1, t2) -> float:
    """Boost if first word matches."""
    first1, first2 = t1[0], t2[0]
    return 1.0 if first1 == first2 else 0.0


# ------------------------
# Composite Scoring
# ------------------------
def compute_match_score(title1, title2, model):
    norm1, norm2 = normalize_title(title1), normalize_title(title2)
    tokens1, tokens2 = tokenize_title(norm1), tokenize_title(norm2)

    score_str = string_similarity(norm1, norm2)
    score_tok = token_similarity(tokens1, tokens2)
    score_cont = containment_similarity(tokens1, tokens2)
    score_emb = embedding_similarity(norm1, norm2, model)
    score_pre = prefix_boost(tokens1, tokens2)

    final_score = (
        0.1 * score_str
        + 0.1 * score_tok
        + 0.4 * score_cont
        + 0.2 * score_emb
        + 0.2 * score_pre
    )

    return final_score


def find_best_match(title, list2, model, threshold):
    best_score, best_title = 0, None
    for candidate in list2:
        score = compute_match_score(title, candidate, model)
        if score > best_score:
            best_score, best_title = score, candidate

    if best_score >= threshold:
        return best_title, best_score
    else:
        return None, best_score


def find_best_match_per_similarity_metric(title, list2, model, threshold):
    best_scores = {
        "string": 0,
        "token": 0,
        "containment": 0,
        "embedding": 0,
        "prefix": 0,
    }
    best_titles = {
        "string": None,
        "token": None,
        "containment": None,
        "embedding": None,
        "prefix": None,
    }

    for candidate in list2:
        norm1, norm2 = normalize_title(title), normalize_title(candidate)
        tokens1, tokens2 = tokenize_title(norm1), tokenize_title(norm2)

        score_string = string_similarity(norm1, norm2)
        score_token = token_similarity(tokens1, tokens2)
        score_containment = containment_similarity(tokens1, tokens2)
        score_embedding = embedding_similarity(norm1, norm2, model)
        score_prefix = prefix_boost(tokens1, tokens2)

        for metric in best_scores.keys():
            if locals()[f"score_{metric}"] > best_scores[metric]:
                best_scores[metric] = locals()[f"score_{metric}"]
                best_titles[metric] = candidate

    return {
        metric: (best_titles[metric], best_scores[metric])
        for metric in best_scores
        if best_scores[metric] >= threshold
    }


def test_schedules_and_attributes(schedules, attributes, model, threshold):
    for sched in schedules:
        best_matches = find_best_match_per_similarity_metric(
            sched["title"], [a["title"] for a in attributes], model, threshold
        )
        print(f"\nTesting '{sched['title']}' against attributes:")
        for metric, (attr_title, score) in best_matches.items():
            print(f"  {metric}: '{attr_title}' (score: {score:.3f})")


def merge_schedules_and_attributes(schedules, attributes, model, threshold):
    merged = []
    for idx, sched in enumerate(schedules):
        match, score = find_best_match(
            sched["title"], [a["title"] for a in attributes], model, threshold
        )
        print(f"Matching '{sched['title']}' -> '{match}' (score: {score:.3f})")
        if match:

            info = next(a for a in attributes if a["title"] == match)
            merged.append(
                {
                    "id": idx,
                    **info,
                    **sched,
                    "attributes": sched.get("attributes", {}),
                }
            )
        else:
            print(f"No matching attribute found for schedule '{sched['title']}'")
            # fallback defaults (like your JS version)
            merged.append(
                {
                    "id": idx,
                    **sched,
                    "duration": "0",
                    "fsk": "Unknown",
                    "genre": "Unknown Genre",
                    "origTitle": "Unknown Original Title",
                    "production": "Unknown Production",
                    "releaseDate": "Unknown Release Date",
                    "distributor": "Unknown Distributor",
                    "director": "Unknown Director",
                    "description": "Unknown Description",
                    "posterUrl": "/placeholder-poster.png",
                    "trailerUrl": "Unknown Trailer URL",
                    "actors": [],
                }
            )
    return merged


def merge_with_posters(movies, posters, model, threshold):

    for movie in movies:
        match, score = find_best_match(
            movie["title"], [p["title"] for p in posters], model, threshold
        )
        print(f"Matching '{movie['title']}' -> '{match}' (score: {score:.3f})")
        if match:
            poster = next(p for p in posters if p["title"] == match)
            movie["posterUrl"] = poster["src"]
    return movies


# ------------------------
# Main Execution
# ------------------------
if __name__ == "__main__":
    schedules = json.loads(
        Path("src/data/movieSchedules.json").read_text(encoding="utf-8")
    )
    attributes = json.loads(
        Path("src/data/movieAttributes.json").read_text(encoding="utf-8")
    )
    posters = json.loads(
        Path("src/data/moviePosterUrls.json").read_text(encoding="utf-8")
    )

    model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

    THRESHOLD = 0.2

    # test_schedules_and_attributes(schedules, attributes, model, THRESHOLD)
    merged1 = merge_schedules_and_attributes(schedules, attributes, model, THRESHOLD)
    merged2 = merge_with_posters(merged1, posters, model, THRESHOLD)

    Path("src/data/source_movie_data.json").write_text(
        json.dumps(merged2, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"Saved {len(merged2)} merged movies to src/data/source_movie_data.json")
