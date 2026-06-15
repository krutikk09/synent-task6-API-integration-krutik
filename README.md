# CineScope

> A premium, portfolio-worthy movie exploration web application powered by the OMDb API.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-purple)

---

## Project Overview

**CineScope** is a modern, dark-themed movie search application designed to feel like a premium SaaS product or streaming platform tool. It combines glassmorphism aesthetics, fluid animations, and a highly interactive user experience to deliver a cinema-grade exploration interface.

Built entirely with **HTML5**, **CSS3**, and **Vanilla JavaScript** using the **Fetch API**, CineScope demonstrates advanced frontend craftsmanship without any frameworks.

---

## Features

### Core Experience
- **Premium Movie Search** — Search movies by title with real-time OMDb API integration
- **Comprehensive Movie Details** — Poster, title, year, genre, runtime, IMDb rating, director, actors, plot, language, and awards
- **Large Glassmorphism Movie Card** — Beautifully presented result with responsive layout

### Design & UX
- **Dark Luxury Theme** — Deep black background with subtle purple and blue accents
- **Animated Gradient Mesh Background** — Floating blobs with soft blur and movement
- **Particle System** — Floating particles for atmospheric depth
- **Glassmorphism UI** — Backdrop blur, translucent surfaces, and soft borders
- **Loading Experience** — Animated logo, progress bar, and skeleton shimmer cards
- **Sticky Glass Navbar** — Scroll-aware transparency with blur effects
- **Premium Hero Section** — Animated text reveal, floating poster mockups, and glow effects

### Interactions & Animations
- Smooth scroll, fade-ins, hover lifts, and scale transitions
- **Animated IMDb Rating Counter** — Rating badge with color coding (excellent/good/poor)
- **Poster Hover Zoom** — Smooth zoom with glow overlay
- **Poster Preview Modal** — Click poster for enlarged view
- **Skeleton Shimmer Loading** — Avoids generic spinners
- **Smooth Toast Notifications** — Success, error, and info states

### Extra Features
- **Recent Searches** — Tag-based history with click-to-search, persisted in `localStorage`
- **Favorites System** — Save and remove favorite movies, persisted in `localStorage`
- **Keyboard Shortcuts** — `Ctrl/Cmd + K` to focus search, `Escape` to close modal
- **Retry Logic** — Beautiful error cards with retry buttons

### Responsive Design
- Fully responsive across mobile, tablet, laptop, and desktop
- Adaptive layouts, collapsing hero visuals, and optimized spacing

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure and accessibility |
| CSS3 | Premium styling, animations, glassmorphism, responsive design |
| Vanilla JavaScript | App logic, API integration, DOM manipulation, state management |
| Fetch API | Asynchronous OMDb API requests |
| OMDb API | Movie data source (titles, posters, ratings, plots, etc.) |
| Google Fonts | Space Grotesk (headings) + Inter (body) |
| LocalStorage | Persistence for favorites and recent searches |

---

## OMDb API Integration

CineScope uses the [OMDb API](http://www.omdbapi.com/) to fetch movie data.

### Getting an API Key

1. Visit [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Choose a free tier (1,000 daily requests) or a paid tier for higher limits
3. Receive your API key via email
4. Open `script.js` and replace:

```javascript
const OMDB_API_KEY = 'YOUR_API_KEY';
```

with your actual key:

```javascript
const OMDB_API_KEY = 'abc12345';
```

### API Endpoints Used

- **Search by title**: `https://www.omdbapi.com/?t={title}&apikey={key}`
- **Search by IMDb ID**: `https://www.omdbapi.com/?i={id}&apikey={key}`

---

## Screenshots

> _Screenshots can be added here after running the application._

| View | Description |
|------|-------------|
| Loading Screen | Animated CineScope logo with progress bar and blur transition |
| Hero Section | Large animated heading, glassmorphism search box, floating posters |
| Movie Result | Glassmorphism card with poster zoom, rating badge, and info grid |
| Favorites Grid | Grid of saved movie cards with hover lift and remove buttons |
| Error State | Beautiful error card with contextual icon and retry button |
| Mobile View | Fully adaptive layout with stacked search and result cards |

---

## Installation Guide

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- An OMDb API key (free tier available)

### Setup Steps

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/yourusername/cinescope.git
   cd cinescope
   ```

2. **Add your OMDb API key** to `script.js`:
   ```javascript
   const OMDB_API_KEY = 'your_api_key_here';
   ```

3. **Open `index.html`** in your browser:
   - Double-click the file, or
   - Use a local server for the best experience:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```

4. **Start exploring** — type a movie title and hit Enter or click Search.

---

## File Structure

```
cinescope/
├── index.html          # Semantic HTML structure
├── style.css           # Premium CSS with animations and glassmorphism
├── script.js           # Vanilla JS app logic and API integration
└── README.md           # Project documentation
```

---

## Future Improvements

- **Multi-result Search** — Support for search queries returning multiple movies (OMDb `s` parameter)
- **Infinite Scroll** — Load more results as the user scrolls
- **Dark/Light Theme Toggle** — Theme switching with persisted preference
- **Advanced Filters** — Filter by year, genre, type (movie/series), and rating
- **Movie Comparison** — Side-by-side comparison of two movies
- **Watchlist & Seen List** — Separate lists for movies to watch and already watched
- **Share Cards** — Generate shareable movie cards as images
- **PWA Support** — Install as a standalone app with offline skeleton screens
- **Caching Layer** — Cache recent API responses to reduce redundant calls

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

> **Crafted with precision.** Powered by OMDb API.
