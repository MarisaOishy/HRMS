import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, MapPin, Briefcase, Clock, Users } from "lucide-react";
import { jobPostings } from "../../data/mockData";

export default function JobPostingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage open positions and applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/recruitment/candidates">
              <Users className="w-4 h-4 mr-2" />
              View Candidates
            </Link>
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="search" placeholder="Search job postings..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobPostings.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={job.status === "Open" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  {job.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Experience: {job.experience}
                </div>
              </div>
              <p className="text-sm text-gray-600">{job.description}</p>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{job.applicants}</span>
                  <span className="text-gray-600"> applicants</span>
                </div>
                <div className="text-sm text-gray-500">Posted {job.postedDate}</div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/recruitment/candidates">View Applicants</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
