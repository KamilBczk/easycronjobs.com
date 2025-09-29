"use client";

import { Job } from "@/types/schedule";
import { JobCard } from "@/components/job-card";

interface JobsGridProps {
  jobs: Job[];
  isLoading?: boolean;
}

function JobCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-5 bg-gray-200 rounded flex-1"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function JobsGrid({ jobs, isLoading = false }: JobsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun job trouvé
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Aucun job ne correspond à vos filtres actuels. Essayez de modifier vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
