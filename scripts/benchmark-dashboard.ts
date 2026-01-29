
// Mock implementation to simulate DB latency without a real connection
const SIMULATED_DB_LATENCY_MS = 20;
const CONNECTION_POOL_SIZE = 5;

// Types
type Lesson = { id: string };
type Section = { lessons: Lesson[] };
type Course = { sections: Section[] };
type Purchase = { Course: Course };
type Progress = { userId: string; lessonId: string; completedAt: Date | null; startedAt: Date | null; updatedAt: Date };

// Mock Data
const generateMockData = (count: number) => {
  const purchases: Purchase[] = [];
  const allProgress: Progress[] = [];

  for (let i = 0; i < count; i++) {
    const lessons: Lesson[] = [
      { id: `l_${i}_1` },
      { id: `l_${i}_2` },
      { id: `l_${i}_3` }
    ];

    purchases.push({
      Course: {
        sections: [{ lessons }]
      }
    });

    // Create progress for these lessons
    lessons.forEach(l => {
      allProgress.push({
        userId: 'user1',
        lessonId: l.id,
        completedAt: Math.random() > 0.5 ? new Date() : null,
        startedAt: new Date(),
        updatedAt: new Date()
      });
    });
  }
  return { purchases, allProgress };
};

const { purchases, allProgress } = generateMockData(30);

// Simple semaphore for connection pool
class Semaphore {
  private tasks: (() => void)[] = [];
  private count: number;

  constructor(count: number) {
    this.count = count;
  }

  async acquire() {
    if (this.count > 0) {
      this.count--;
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      this.tasks.push(resolve);
    });
  }

  release() {
    this.count++;
    if (this.tasks.length > 0) {
      this.count--;
      const next = this.tasks.shift();
      if (next) next();
    }
  }
}

const pool = new Semaphore(CONNECTION_POOL_SIZE);

// Mock Prisma
const prismaMock = {
  progress: {
    findMany: async (args: any) => {
      await pool.acquire();
      try {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_DB_LATENCY_MS));
        const lessonIds = args.where.lessonId?.in;
        if (lessonIds) {
          return allProgress.filter(p => lessonIds.includes(p.lessonId));
        }
        return [];
      } finally {
        pool.release();
      }
    }
  }
};

async function main() {
  console.log(`Running benchmark with ${purchases.length} courses.`);
  console.log(`Simulated DB Latency: ${SIMULATED_DB_LATENCY_MS}ms per query.`);
  console.log(`Simulated Pool Size: ${CONNECTION_POOL_SIZE}`);

  // --- BASELINE ---
  console.log("\n--- Running Baseline (N+1) ---");
  const startBaseline = performance.now();

  await Promise.all(
    purchases.map(async (purchase) => {
      const lessonIds = purchase.Course.sections.flatMap(s => s.lessons.map(l => l.id));
      // N+1 Query here
      const progressRecords = await prismaMock.progress.findMany({
        where: {
          userId: 'user1',
          lessonId: { in: lessonIds }
        }
      });

      const totalLessons = lessonIds.length;
      const completedLessons = progressRecords.filter(p => p.completedAt != null).length;
      return { totalLessons, completedLessons };
    })
  );

  const endBaseline = performance.now();
  const durationBaseline = endBaseline - startBaseline;
  console.log(`Baseline Time: ${durationBaseline.toFixed(2)}ms`);

  // --- OPTIMIZED ---
  console.log("\n--- Running Optimized (Batch) ---");
  const startOptimized = performance.now();

  // 1. Collect IDs
  const allLessonIds = purchases.flatMap(p => p.Course.sections.flatMap(s => s.lessons.map(l => l.id)));

  // 2. Single Query
  const allProgressRecords = await prismaMock.progress.findMany({
    where: {
      userId: 'user1',
      lessonId: { in: allLessonIds }
    }
  });

  // 3. Map in memory
  purchases.map((purchase) => {
    const lessonIds = purchase.Course.sections.flatMap(s => s.lessons.map(l => l.id));
    const lessonIdsSet = new Set(lessonIds);
    const progressRecords = allProgressRecords.filter(p => lessonIdsSet.has(p.lessonId));

    const totalLessons = lessonIds.length;
    const completedLessons = progressRecords.filter(p => p.completedAt != null).length;
    return { totalLessons, completedLessons };
  });

  const endOptimized = performance.now();
  const durationOptimized = endOptimized - startOptimized;
  console.log(`Optimized Time: ${durationOptimized.toFixed(2)}ms`);

  console.log(`\nImprovement: ${(durationBaseline / durationOptimized).toFixed(2)}x faster`);
}

main();
