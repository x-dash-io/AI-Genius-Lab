export type TestimonialCategory = "all" | "courses" | "learning-paths" | "platform";

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    rating: number;
    text: string;
    category: TestimonialCategory;
    courseOrPath?: string;
    date: string;
    featured?: boolean; // New field for homepage selection
}

export const testimonials: Testimonial[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        role: "Marketing Manager",
        rating: 5,
        text: "AI Genius Lab transformed how I approach content creation. The courses are practical, well-structured, and immediately applicable. I've automated 60% of my content workflow!",
        category: "courses",
        courseOrPath: "AI for Content Creation",
        date: "2024-01-15",
        featured: true,
    },
    {
        id: "2",
        name: "Michael Chen",
        role: "Software Developer",
        rating: 5,
        text: "The learning paths are incredible! Going from beginner to building production AI apps in just 3 months. The structured approach made all the difference.",
        category: "learning-paths",
        courseOrPath: "Full-Stack AI Developer Path",
        date: "2024-01-10",
        featured: true,
    },
    {
        id: "3",
        name: "Emily Rodriguez",
        role: "Business Analyst",
        rating: 5,
        text: "I had zero AI experience before this. Now I'm implementing AI solutions at my company and getting recognized for it. The courses break down complex concepts beautifully.",
        category: "courses",
        courseOrPath: "AI for Business Professionals",
        date: "2024-01-08",
    },
    {
        id: "4",
        name: "David Thompson",
        role: "Entrepreneur",
        rating: 5,
        text: "The platform is intuitive and the progress tracking keeps me motivated. Lifetime access means I can learn at my own pace without pressure. Best investment I've made!",
        category: "platform",
        date: "2024-01-05",
        featured: true,
    },
    {
        id: "5",
        name: "Lisa Park",
        role: "Data Scientist",
        rating: 5,
        text: "Even as someone with a technical background, I learned so much. The advanced courses go deep into real-world applications. Highly recommend for all skill levels.",
        category: "courses",
        courseOrPath: "Advanced Machine Learning",
        date: "2023-12-28",
    },
    {
        id: "6",
        name: "James Wilson",
        role: "Product Manager",
        rating: 5,
        text: "The AI Product Management path gave me the confidence to lead AI initiatives at my company. Practical case studies and hands-on projects were game-changers.",
        category: "learning-paths",
        courseOrPath: "AI Product Management Path",
        date: "2023-12-20",
        featured: true,
    },
    {
        id: "7",
        name: "Anna Kowalski",
        role: "Freelance Writer",
        rating: 5,
        text: "I was skeptical about AI replacing writers, but this course showed me how to use AI as a powerful assistant. My productivity tripled and quality improved!",
        category: "courses",
        courseOrPath: "AI-Powered Writing",
        date: "2023-12-15",
    },
    {
        id: "8",
        name: "Robert Martinez",
        role: "Startup Founder",
        rating: 5,
        text: "Building an AI startup without understanding AI would've been impossible. This platform gave me the knowledge I needed to make informed decisions and lead my team.",
        category: "platform",
        date: "2023-12-10",
    },
    {
        id: "9",
        name: "Jessica Lee",
        role: "UX Designer",
        rating: 5,
        text: "The AI for Design course opened my eyes to new possibilities. I'm now creating personalized user experiences with AI that our users love. Absolutely transformative!",
        category: "courses",
        courseOrPath: "AI for UX Design",
        date: "2023-12-05",
    },
];
