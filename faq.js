const translations = {
    en: {
        tagline: 'Your local cinema showtimes in Tübingen',
        faqs:`
        <h2>FAQs</h2>
            <div class="faq">
                <h3>What is Kinoschurke?</h3>
                <p>Kinoschurke is a free, open-source tool to help you quickly view movie show times across all cinemas in Tübingen as timelines. 
                You can see what's playing now, what's about to start, plan for the next week, and even book your tickets.</p>
            </div>
            <div class="faq">
                <h3>How does Kinoschurke work?</h3>
                <p>The data is retrieved from the official website of the <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a> and from <a href="https://kinoheld.de/">Kinoheld</a>, 
                where the cinema program is updated every Tuesday. That's where our name comes from: We collect our data from Kinoheld (Held = Hero), which would make us the Kinoschurke (Schurke = Villain, Scoundrel)</p>
            </div>
            <div class="faq">
                <h3>Is this an official site?</h3>
                <p>No, this is an independent open-source hobby project that organizes show times for convenience. 
                We appreciate the official site, <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a>, but we're not associated with it. 
                We simply collect our data from their page and display it in our custom visualization. </p>
            </div>
            <div class="faq">
                <h3>Is booking tickets on this site safe?</h3>
                <p>Yes. We get all our data, including the booking links for each showtime, directly from the official <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a> website. 
                They use the booking system provided by <a href="https://kinoheld.de/">Kinoheld</a>. So when you click on the 'Book Ticket' button on our page, 
                you'll be redirected to the same booking widget that you'd see on the official site. We don't have our own booking system on this site; 
                everything is handled through the official widget from Kinoheld.</p>
                <p>But as this website is mainly a visualization tool, you can just use it to look up your preferred show times and then proceed to book your ticket from the official sites if you'd prefer.</p>
            </div>
            <div class="faq">
                <h3>Why would someone create this website??</h3>
                <p>Has this ever happened to you? You love going to the movies, so much so that you buy an "Unlimited Subscription" to see even more movies at your local cinema. 
                But now, there are so many movies to choose from that it's hard to decide which ones to see, when they're playing, and at which cinema. 
                You visit the official page of your local cinemas, which is designed beautifully but somehow still doesn't organize movie show times in a way that feels natural to you.
                <br>So, like anyone would, you think to yourself, "It can't be that hard to write a script that copies all the show times from the official site and 
                build a custom website that displays these show times in a way that feels natural to me, preferably in a nice timeline overview per day, can it?"
                <br>So yeah, that’s what happened to me and why I built this website. I hope you have fun using it!</p>
            </div>
            <div class="faq">
                <h3>How can I support Kinoschurke?</h3>
                <p>If you like Kinoschurke, you are welcome to recommend the website to others. We also welcome feedback and suggestions for improvement to<span class="ct"></span></p>
            </div>
            `,
    },
    de: { 
        tagline: 'Das Programm der Tübinger Kinos',
        faqs: `
        <h2>FAQs</h2>
            <div class="faq">
                <h3>Was ist Kinoschurke?</h3>
                <p>Kinoschurke ist ein kostenloses Open-Source-Visualisierungstool, mit dem du schnell die Kinoprogramme aller Tübinger Kinos als Timelines einsehen kannst. Du kannst sehen, was gerade läuft, was demnächst beginnt, für die nächste Woche planen und sogar Tickets buchen.</p>
            </div>
            <div class="faq">
                <h3>Wie funktioniert Kinoschurke?</h3>
                <p>Die Daten werden von der offiziellen Seite der <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a> und von <a href="https://kinoheld.de/">Kinoheld</a> abgerufen, wo das Kinoprogramm jeden Dienstag aktualisiert wird. 
                Daher auch unser Name: Wir bekommen unsere Daten von Kinoheld, das macht uns wohl zum ... Kinoschurken.</p>
            </div>
            <div class="faq">
                <h3>Ist das eine offizielle Seite?</h3>
                <p>Nein, das ist ein unabhängiges Open-Source-Hobbyprojekt, das aus Gründen der Bequemlichkeit Vorstellungszeiten organisiert. 
                Wir finden die offizielle Seite <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a> wunderbar, sind aber nicht mit ihr verbunden. 
                Wir sammeln nur unsere Daten von deren Seite und zeigen sie in unserer eigenen Visualisierung an. </p>
            </div>
            <div class="faq">
                <h3>Ist die Buchung von Tickets auf dieser Website sicher?</h3>
                <p>Ja. Wir kriegen alle Daten, auch die Buchungslinks für die einzelnen Vorstellungen, direkt von der offiziellen Website der <a href="https://tuebinger-kinos.de/">Tübinger Kinos</a>. 
                Diese nutzt das Buchungssystem von <a href="https://kinoheld.de/">Kinoheld</a>. Wenn du auf unserer Seite auf die Schaltfläche "Ticket buchen" klickst, wirst du zu demselben Buchungs-Widget weitergeleitet, 
                das du auch auf der offiziellen Website siehst. Wir haben kein eigenes Buchungssystem auf dieser Seite, sondern nutzen das offizielle Widget von Kinoheld.</p>
                <p>Da diese Website aber hauptsächlich der Visualisierung dient, kannst du hier auch einfach nachschlagen, wann deine Lieblingsvorstellung läuft und dann dein Ticket über die offiziellen Seiten buchen, wenn dir das lieber ist.</p>
            </div>
            <div class="faq">
                <h3>Warum würde jemand so eine Website bauen?</h3>
                <p>Ist dir das auch schon mal passiert? Du gehst so gerne ins Kino, dass du dir ein "Unlimited-Abo" holst, um noch mehr Filme in deinem örtlichen Kino zu sehen. 
                Aber jetzt gibt es so viele Filme, dass es schwer ist, sich zu entscheiden, welche Filme du sehen willst, wann sie laufen und in welchem Kino. Du besuchst die offizielle Seite deines örtlichen Kinos, 
                die natürlich schön gestaltet ist, aber die Kinoprogramme sind irgendwie nicht so organisiert, dass sie sich für dich natürlich anfühlen.
                <br>Wie jeder andere auch, denkst du dir: "Es kann doch nicht so schwer sein, ein Skript zu schreiben, das alle Vorstellungszeiten von der offiziellen Seite kopiert, und eine eigene Website zu erstellen, die diese Vorstellungszeiten so anzeigt, dass sie sich für mich natürlich anfühlen, am besten in einer schönen Timeline pro Tag, oder?"
                <br>Also so ungefähr ist diese Idee entstanden und deswegen habe ich diese Website gebaut, viel Spaß damit!</p>
            </div>
            <div class="faq">
                <h3>Wie kann ich Kinoschurke unterstützen?</h3>
                <p class="ct-p">Wenn dir Kinoschurke gefällt, kannst du die Webseite gerne weiterempfehlen. Über Feedback und Verbesserungsvorschläge freuen wir uns ebenfalls an<span class="ct"></span></p>
            </div>`,
    }
};
const userLang = navigator.language || navigator.userLanguage;
const language = userLang.startsWith('de') ? 'de' : 'en';

function handleThemeChange() {
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const contact = document.querySelector('.ct');
    

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = `<i class="bi bi-sun"></i>`;
        contact.innerHTML = `<img src="/assets/imgs/contact_dark.png" alt="contact">`;
        const img = document.querySelector('.ct img');
        img.style.height = '23px';
        img.style.marginLeft = '2px';
        img.style.top = '-2px';
        img.style.filter = 'brightness(1.07)';
    } else {
        themeToggle.innerHTML = `<i class="bi bi-moon"></i>`;
        contact.innerHTML = `<img src="/assets/imgs/contact_light.png" alt="contact">`;
        const img = document.querySelector('.ct img');
        img.style.height = '19px';
        img.style.marginLeft = '2px';
        img.style.top = '-0.8px';
        img.style.filter = 'brightness(1.005)';
    }

    themeToggle.addEventListener('click', function () {
        let theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = `<i class="bi bi-sun"></i>`;
            localStorage.setItem('theme', 'dark');
            contact.innerHTML = `<img src="/assets/imgs/contact_dark.png" alt="contact">`;
            const img = document.querySelector('.ct img');
            img.style.height = '23px';
            img.style.marginLeft = '2px';
            img.style.top = '-2px';
            img.style.filter = 'brightness(1.07)';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = `<i class="bi bi-moon"></i>`;
            localStorage.setItem('theme', 'light');
            contact.innerHTML = `<img src="/assets/imgs/contact_light.png" alt="contact">`;
            const img = document.querySelector('.ct img');
            img.style.height = '19px';
            img.style.marginLeft = '2px';
            img.style.top = '-0.8px';
            img.style.filter = 'brightness(1.005)';
        }
    });

}

function updateLanguage() {
    document.getElementById('tagline').textContent = translations[language].tagline;
    document.querySelector('.faq-container').innerHTML = translations[language].faqs;
}

updateLanguage();

handleThemeChange();


