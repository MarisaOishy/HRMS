import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function PerformanceFeedbackPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          to="/performance/reviews"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to reviews
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Submit Feedback</h1>
        <p className="text-gray-600 mt-1">Provide feedback for an employee</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emp001">Sarah Johnson</SelectItem>
                  <SelectItem value="emp002">Michael Chen</SelectItem>
                  <SelectItem value="emp003">Emily Rodriguez</SelectItem>
                  <SelectItem value="emp004">James Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Review Period *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2026">Q1 2026</SelectItem>
                  <SelectItem value="q4-2025">Q4 2025</SelectItem>
                  <SelectItem value="q3-2025">Q3 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technical">Technical Skills (1-5) *</Label>
                <Input id="technical" type="number" min="1" max="5" placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communication">Communication (1-5) *</Label>
                <Input id="communication" type="number" min="1" max="5" placeholder="4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamwork">Teamwork (1-5) *</Label>
                <Input id="teamwork" type="number" min="1" max="5" placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadership">Leadership (1-5) *</Label>
                <Input id="leadership" type="number" min="1" max="5" placeholder="4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments *</Label>
              <Textarea
                id="comments"
                placeholder="Provide detailed feedback on the employee's performance..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Goals for Next Period</Label>
              <Textarea
                id="goals"
                placeholder="List goals for the next review period (one per line)..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg">
                Submit Feedback
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link to="/performance/reviews">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
