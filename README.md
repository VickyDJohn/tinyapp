# TinyApp

TinyApp is a full-stack web application that allows users to shorten long URLs into compact, shareable links. It provides a convenient way to manage and track multiple URLs in a user-friendly interface. Built with Node.js, Express, EJS, and bcrypt, TinyApp offers secure and efficient URL shortening functionality.

## Features

- User Registration: Create an account to access personalized URL management.
- URL Shortening: Shorten any long URL into a compact, unique short URL.
- URL Management: View, edit, and delete your shortened URLs.
- Access Control: Only registered users can create, manage, and view their own URLs.
- Secure Password Storage: User passwords are hashed using bcrypt for enhanced security.

## Setup

1. Clone the repository: `git clone https://github.com/your-username/tinyapp.git`
2. Install the dependencies: `npm install`
3. Start the server: `npm start`
4. Open your browser and visit `http://localhost:8080`

## Usage

1. Register a new account or log in if you already have one.
2. Create a new shortened URL by entering a long URL and clicking "Submit".
3. Manage your URLs on the "My URLs" page. Edit, delete, or copy the shortened URL.

## Screenshots

![Login Page](/screenshots/login-page.png)
*Login Page*

![URLs Index Page](/screenshots/urls-index.png)
*URLs Index Page*

## Dependencies

- Express: Fast and minimalist web framework for Node.js.
- EJS: Embedded JavaScript templating for dynamic HTML rendering.
- bcrypt: Password hashing library for secure password storage.
- cookie-session: Simple cookie-based session middleware for Express.
- morgan: HTTP request logger middleware for Express.