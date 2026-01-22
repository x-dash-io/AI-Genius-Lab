import {
  getRevenueOverTime,
  getCategorySales,
  getUserGrowth,
  getEnrollmentTrends,
  getTopCoursesByRevenue,
} from "@/lib/admin/analytics";
import {
  RevenueChart,
  CategorySalesChart,
  UserGrowthChart,
  EnrollmentTrendsChart,
  TopCoursesChart,
} from "./AnalyticsCharts";

export async function AnalyticsSection() {
  const [revenueData, categoryData, userGrowthData, enrollmentData, topCoursesData] = await Promise.all([
    getRevenueOverTime(30),
    getCategorySales(),
    getUserGrowth(30),
    getEnrollmentTrends(30),
    getTopCoursesByRevenue(10),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <CategorySalesChart data={categoryData} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart data={userGrowthData} />
        <EnrollmentTrendsChart data={enrollmentData} />
      </div>
      <TopCoursesChart data={topCoursesData} />
    </div>
  );
}
