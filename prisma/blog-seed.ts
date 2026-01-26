import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleBlogPosts = [
  {
    title: "Getting Started with AI: A Beginner's Guide",
    slug: "getting-started-with-ai-beginners-guide",
    excerpt: "Learn the fundamentals of artificial intelligence and how you can start your journey into this exciting field.",
    content: `## What is Artificial Intelligence?

Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence.

### Key Concepts

- **Machine Learning**: Systems that learn from data
- **Neural Networks**: Computing systems inspired by biological neural networks
- **Deep Learning**: A subset of machine learning using multi-layered neural networks

## Why Learn AI in 2024?

AI is transforming every industry and creating new career opportunities. From healthcare to finance, AI applications are everywhere.

### Getting Started Steps

1. **Learn the Basics**: Start with Python programming
2. **Understand Mathematics**: Focus on linear algebra and calculus
3. **Explore ML Frameworks**: Try TensorFlow or PyTorch
4. **Build Projects**: Apply your knowledge to real problems

\`\`\`python
# Simple AI example
def hello_ai():
    print("Hello, AI World!")
    
hello_ai()
\`\`\`

## Conclusion

Starting your AI journey is exciting but requires dedication. Take it one step at a time and build a strong foundation.`,
    published: true,
    publishedAt: new Date("2024-01-15"),
    author: "AI Genius Lab Team",
    category: "AI & Machine Learning",
    tags: ["artificial-intelligence", "beginners", "machine-learning", "python"],
    featured: true,
    readingTime: 5,
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    title: "Building Modern Web Apps with Next.js 15",
    slug: "building-modern-web-apps-nextjs-15",
    excerpt: "Discover the latest features in Next.js 15 and how to leverage them for building performant web applications.",
    content: `## What's New in Next.js 15?

Next.js 15 brings exciting improvements that make web development faster and more efficient.

### Key Features

- **Turbopack**: Faster builds and hot reload
- **Improved App Router**: Better routing capabilities
- **Server Components**: Enhanced server-side rendering

## Setting Up Your First Next.js 15 Project

\`\`\`bash
npx create-next-app@latest my-app --typescript
cd my-app
npm run dev
\`\`\`

### Project Structure

The new app router structure organizes your code in a more intuitive way:

- \`app/\`: Main application directory
- \`components/\`: Reusable UI components
- \`lib/\`: Utility functions and configurations

## Best Practices

1. Use Server Components when possible
2. Implement proper error boundaries
3. Optimize images with the Image component
4. Leverage caching strategies

## Conclusion

Next.js 15 provides powerful tools for building modern web applications. Start exploring these features today!`,
    published: true,
    publishedAt: new Date("2024-01-20"),
    author: "Tech Team",
    category: "Web Development",
    tags: ["nextjs", "react", "web-development", "javascript"],
    featured: false,
    readingTime: 7,
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    title: "The Future of Educational Technology",
    slug: "future-educational-technology",
    excerpt: "Exploring how AI and technology are reshaping the landscape of education and learning.",
    content: `## The Evolution of EdTech

Educational technology has come a long way from simple computer-based training to AI-powered personalized learning platforms.

### Current Trends

- **Personalized Learning**: AI adapts to individual student needs
- **Virtual Classrooms**: Immersive learning experiences
- **Automated Assessment**: Instant feedback and grading

## AI in Education

Artificial Intelligence is revolutionizing how we learn and teach.

### Benefits

1. Personalized learning paths
2. 24/7 availability
3. Data-driven insights
4. Cost-effective scaling

### Challenges

- Data privacy concerns
- Digital divide
- Teacher training needs

## What's Next?

The future of EdTech holds exciting possibilities:

- VR/AR integration
- Brain-computer interfaces
- Quantum computing applications

## Conclusion

As technology advances, education will become more accessible, personalized, and effective for learners worldwide.`,
    published: true,
    publishedAt: new Date("2024-01-25"),
    author: "Education Team",
    category: "Industry Insights",
    tags: ["edtech", "ai-in-education", "future-tech", "learning"],
    featured: false,
    readingTime: 6,
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    title: "Mobile Development Trends in 2024",
    slug: "mobile-development-trends-2024",
    excerpt: "Stay ahead with the latest mobile development trends and technologies shaping the industry this year.",
    content: `## Top Mobile Development Trends for 2024

The mobile development landscape is constantly evolving. Here's what's trending in 2024.

### 1. Cross-Platform Development

Frameworks like React Native and Flutter continue to dominate, offering code reusability and faster development.

### 2. AI Integration

Mobile apps are increasingly incorporating AI features:
- Natural language processing
- Computer vision
- Predictive analytics

### 3. 5G Optimization

With 5G rollout, apps can leverage:
- Faster downloads
- Lower latency
- Enhanced real-time features

## Best Practices

1. **Performance First**: Optimize for speed and battery life
2. **User Experience**: Focus on intuitive design
3. **Security**: Implement robust security measures
4. **Accessibility**: Ensure apps are usable by everyone

## Tools and Technologies

- React Native
- Flutter
- Kotlin
- Swift
- Xamarin

## Conclusion

Mobile development continues to evolve rapidly. Stay updated with these trends to build successful mobile applications.`,
    published: true,
    publishedAt: new Date("2024-01-18"),
    author: "Mobile Team",
    category: "Mobile Development",
    tags: ["mobile-development", "react-native", "flutter", "5g"],
    featured: false,
    readingTime: 5,
    ratingAvg: 0,
    ratingCount: 0,
  },
  {
    title: "Data Science Fundamentals: From Zero to Hero",
    slug: "data-science-fundamentals-zero-to-hero",
    excerpt: "Master the essential concepts of data science and start your journey into this high-demand field.",
    content: `## What is Data Science?

Data science is an interdisciplinary field that uses scientific methods, processes, and algorithms to extract knowledge from data.

### Core Components

1. **Statistics**: The foundation of data analysis
2. **Programming**: Python and R are popular choices
3. **Machine Learning**: Building predictive models
4. **Data Visualization**: Communicating insights effectively

## Getting Started

### Step 1: Learn Python

Python is the most popular language for data science:

\`\`\`python
import pandas as pd
import numpy as np

# Load data
data = pd.read_csv('dataset.csv')
\`\`\`

### Step 2: Master Statistics

Key concepts to understand:
- Descriptive statistics
- Probability theory
- Hypothesis testing
- Regression analysis

### Step 3: Explore Machine Learning

Start with simple algorithms:
- Linear regression
- Decision trees
- K-means clustering

## Tools and Libraries

- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning
- **Matplotlib**: Visualization
- **Jupyter**: Interactive notebooks

## Career Opportunities

Data scientists are in high demand across industries:
- Tech companies
- Healthcare
- Finance
- Retail
- Government

## Conclusion

Data science offers exciting career opportunities. Start with the fundamentals and gradually build your expertise through projects and continuous learning.`,
    published: true,
    publishedAt: new Date("2024-01-22"),
    author: "Data Team",
    category: "Data Science",
    tags: ["data-science", "python", "machine-learning", "statistics"],
    featured: false,
    readingTime: 8,
    ratingAvg: 0,
    ratingCount: 0,
  },
];

async function seedBlog() {
  console.log("🌱 Seeding blog posts...");

  for (const post of sampleBlogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log("✅ Blog posts seeded successfully!");
}

seedBlog()
  .catch((e) => {
    console.error("❌ Error seeding blog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
