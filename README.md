# Calorie Counter Web App

A simple, full-stack calorie tracking application that allows users to sign up, log in, set personal health goals (maintain/lose/gain weight), calculate daily calorie needs using the Mifflin-St Jeor formula, and log daily food intake with persistent history.

## Features

- User authentication (Sign Up / Sign In) with JWT
- Profile setup: goal (maintain/lose/gain), weight, height, age, gender
- Automatic daily calorie recommendation (BMR × 1.2 ± 500 kcal adjustment)
- Food logging with a built-in food database (static datalist)
- Daily calorie tracking + historical view grouped by date
- Responsive design with background images
- Persistent data storage in MySQL

## Tech Stack

**Frontend**
- HTML5
- CSS3 (vanilla with modular files)
- JavaScript (vanilla + Fetch API)

**Backend**
- Node.js + Express.js
- JWT for authentication
- bcryptjs for password hashing
- MySQL database

**Database**
- MySQL (tables: users, user_profiles, food_entries)

## Project Structure
