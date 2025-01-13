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
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/date" replace />} />
            <Route path="/date" element={<DatePage />} />
            <Route path="/room" element={<RoomPage />} />
            <Route path="/movie/:movieSlug" element={<MoviePage />} />
            <Route path="/movie" element={<MoviePage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Route>,
    ),
    {
        basename: "/kino2",
    },
);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
