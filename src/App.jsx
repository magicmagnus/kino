import React from "react";
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DatePage from "./pages/DatePage";
import RoomPage from "./pages/RoomPage";
import MoviePage from "./pages/MoviePage";
import EventPage from "./pages/EventPage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dates" replace />} />
            <Route path="/dates/:dateSlug" element={<DatePage />} />
            <Route path="/dates" element={<DatePage />} />
            <Route path="/rooms/:roomSlug" element={<RoomPage />} />
            <Route path="/rooms" element={<RoomPage />} />
            <Route path="/movies/:movieSlug" element={<MoviePage />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/events/:eventSlug" element={<EventPage />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Route>,
    ),
);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
