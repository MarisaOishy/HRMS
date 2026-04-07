import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Star, Eye, Plus } from "lucide-react";
import { performanceReviews } from "../../data/mockData";

export default function PerformanceReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-1">Track employee performance and goals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/performance/feedback">Submit Feedback</Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Review
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {performanceReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{review.employeeName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Period: {review.period} • Reviewer: {review.reviewer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-semibold text-gray-900">{review.rating}</span>
                  <span className="text-gray-600">/ 5.0</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Technical Skills</span>
                    <span className="font-medium">{review.technicalSkills}/5</span>
                  </div>
                  <Progress value={review.technicalSkills * 20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Communication</span>
                    <span className="font-medium">{review.communication}/5</span>
                  </div>
                  <Progress value={review.communication * 20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Teamwork</span>
                    <span className="font-medium">{review.teamwork}/5</span>
                  </div>
                  <Progress value={review.teamwork * 20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Leadership</span>
                    <span className="font-medium">{review.leadership}/5</span>
                  </div>
                  <Progress value={review.leadership * 20} />
                </div>
              </div>

              {/* Comments */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Comments</p>
                <p className="text-gray-600">{review.comments}</p>
              </div>

              {/* Goals */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Goals for Next Period</p>
                <div className="space-y-2">
                  {review.goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">Reviewed on {review.reviewDate}</p>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
