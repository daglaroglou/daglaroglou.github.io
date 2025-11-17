import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, TrendingUp } from "lucide-react";
import gradesData from "@/data/grades.json";

interface Course {
  courseCode: string;
  courseName: string;
  grade: number | string;
  ects: number;
  passed: boolean;
}

interface Semester {
  semester: string;
  courses: Course[];
}

interface Year {
  year: string;
  semesters: Semester[];
}

const UniversityGrades = () => {
  const { student, overallAverage, overallECTS, years } = gradesData;

  const getGradeColor = (grade: number | string) => {
    if (typeof grade !== "number") return "text-muted-foreground";
    if (grade >= 8.5) return "text-green-500";
    if (grade >= 6.5) return "text-blue-500";
    if (grade >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  const calculateSemesterAverage = (courses: Course[]) => {
    const validCourses = courses.filter(
      (c) => typeof c.grade === "number" && c.grade > 0
    );
    if (validCourses.length === 0) return 0;

    const total = validCourses.reduce((sum, c) => {
      const grade = typeof c.grade === "number" ? c.grade : 0;
      return sum + grade * c.ects;
    }, 0);

    const totalEcts = validCourses.reduce((sum, c) => sum + c.ects, 0);
    return totalEcts > 0 ? (total / totalEcts).toFixed(2) : 0;
  };

  const passedCount = years.reduce((total, year) => {
    return (
      total +
      year.semesters.reduce((semTotal, semester) => {
        return semTotal + semester.courses.filter((c) => c.passed).length;
      }, 0)
    );
  }, 0);

  const totalCourses = years.reduce((total, year) => {
    return (
      total +
      year.semesters.reduce((semTotal, semester) => {
        return semTotal + semester.courses.length;
      }, 0)
    );
  }, 0);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/20 via-background to-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">
            University Progress
          </h2>
          <p className="text-muted-foreground">
            {student.firstName} {student.lastName} • {student.studentNo}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                  Overall Average
                </h3>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${getGradeColor(overallAverage)}`}>
                {overallAverage}
              </span>
              <span className="text-2xl text-muted-foreground mb-1">/10</span>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                  Total ECTS
                </h3>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-500">{overallECTS}</span>
              <span className="text-2xl text-muted-foreground mb-1">/240</span>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                  Courses Passed
                </h3>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-500">{passedCount}</span>
              <span className="text-2xl text-muted-foreground mb-1">/{totalCourses}</span>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                  Progress
                </h3>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-purple-500">
                {Math.round((overallECTS / 240) * 100)}
              </span>
              <span className="text-2xl text-muted-foreground mb-1">%</span>
            </div>
          </Card>
        </div>

        {/* Years and Semesters */}
        <div className="space-y-8">
          {years.map((year: Year, yearIndex: number) => (
            <div key={yearIndex} className="animate-fade-in" style={{ animationDelay: `${(yearIndex + 4) * 100}ms` }}>
              <h3 className="text-2xl font-bold mb-4 text-primary">{year.year}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {year.semesters.map((semester: Semester, semIndex: number) => (
                  <Card
                    key={semIndex}
                    className="glass-card p-6 hover-lift transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold">{semester.semester}</h4>
                      <span className="text-sm text-muted-foreground">
                        Avg: {calculateSemesterAverage(semester.courses)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {semester.courses.map((course: Course, courseIndex: number) => (
                        <div
                          key={courseIndex}
                          className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {course.courseName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.courseCode} • {course.ects} ECTS
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span
                              className={`text-2xl font-bold ${getGradeColor(course.grade)}`}
                            >
                              {course.grade}
                            </span>
                            {course.passed ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityGrades;

