# 🚀 Amish Rahman | Full-Stack Developer & AI Creator Portfolio

A premium, high-performance **3D developer portfolio website** built with **React**, **TypeScript**, **Three.js / WebGL**, **GSAP**, and **Framer Motion**. It showcases advanced interface designs, data-driven integrations, and interactive creative elements.

---

## ✨ Features & Highlights

- **3D Interactive Scene**: Dynamic WebGL rendering of a character model using **Three.js** and **React Three Fiber**.
- **All Works Fan Layout**: Programmatic circular-to-arc transition layouts mapping scrolling and touch events directly to card positions using **Framer Motion**.
- **LeetCode Stats Integration**: Live stats card fetching real-time solved problems directly from your LeetCode profile using a public REST API, with static local fallbacks.
- **Play (Chess & AI Chatbot)**: Challenge an interactive chess engine (powered by Stockfish/Redox) and chat with a custom AI twin representing **Amish Rahman** using Groq's **Llama-3.3-70b-versatile** model.
- **Certifications Gallery**: Dynamic, responsive certificate presentation categorized into Development, AI/Cloud, Hackathons, and Security.

---

## 🧰 Tech Stack

- **Frontend**: React.js, TypeScript, Framer Motion, GSAP, CSS3
- **3D Engine**: Three.js, React Three Fiber, WebGL, Draco compression
- **API & Serverless**: Vercel Serverless Functions, Groq API, REST API
- **Logic**: Chess.js (engine coordination), EmailJS

---

## 🚀 Getting Started

### 1) Clone
```bash
git clone https://github.com/AmishRahman2005/Amish_Portfolio.git
cd Amish_Portfolio
```

### 2) Install Dependencies
```bash
npm install
```

### 3) Set Up Environment Variables
Create a `.env` file in the root directory and add your keys:
```env
# EmailJS Setup
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

For the chatbot API in production, set up `GROQ_API_KEY` on your hosting platform (e.g. Vercel dashboard).

### 4) Run Locally
```bash
npm run dev
```

### 5) Production Build
```bash
npm run build
```

---

## 🤝 Connect
- **LinkedIn**: [Amish Rahman](https://www.linkedin.com/in/amish-rahman-2k26/)
- **GitHub**: [@AmishRahman2005](https://github.com/AmishRahman2005)
- **LeetCode**: [@AmishRahman](https://leetcode.com/u/AmishRahman/)
- **Email**: amishrahmanind@gmail.com

---

## 🪪 License

This project is open-source and licensed under the **MIT License**.
