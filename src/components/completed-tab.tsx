"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  Loader2,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  RefreshCw,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobRun {
  id: string;
  jobId: string;
  state: "OK" | "FAIL" | "TIMEOUT" | "RUNNING" | "QUEUED";
  startedAt: string;
  finishedAt: string | null;
  attempts: number;
  exitCode: number | null;
  log: string | null;
  job: {
    id: string;
    name: string;
    category: {
      name: string;
    } | null;
  };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
}

interface Job {
  id: string;
  name: string;
  categoryId: string | null;
}

const stateColors: Record<string, string> = {
  OK: "bg-green-100 text-green-800 border-green-200",
  FAIL: "bg-red-100 text-red-800 border-red-200",
  TIMEOUT: "bg-orange-100 text-orange-800 border-orange-200",
  RUNNING: "bg-blue-100 text-blue-800 border-blue-200",
  QUEUED: "bg-gray-100 text-gray-800 border-gray-200",
};

const stateIcons: Record<string, any> = {
  OK: CheckCircle2,
  FAIL: XCircle,
  TIMEOUT: Timer,
  RUNNING: Loader2,
  QUEUED: Clock,
};

export function CompletedTab() {
  const [mode, setMode] = useState<"history" | "live">("history");
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [jobFilters, setJobFilters] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Sorting
  const [sortBy, setSortBy] = useState<string>("startedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Log viewer
  const [selectedRun, setSelectedRun] = useState<JobRun | null>(null);
  const [showLogDialog, setShowLogDialog] = useState(false);

  // Load filter options (categories and jobs)
  const loadFilters = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("categoryId", categoryFilter);
      }

      const response = await fetch(`/api/filters?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch filters");

      const data = await response.json();
      setCategories(data.categories);
      setJobs(data.jobs);

      // Filter jobs based on selected category
      if (categoryFilter !== "all") {
        setFilteredJobs(data.jobs.filter((job: Job) => job.categoryId === categoryFilter));
      } else {
        setFilteredJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }, [categoryFilter]);

  const loadRuns = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: mode === "live" ? "1" : pagination.page.toString(),
        pageSize: mode === "live" ? "30" : pagination.pageSize.toString(),
        sortBy,
        sortOrder,
      });

      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
      if (jobFilters.length > 0) {
        jobFilters.forEach((jobId) => params.append("jobIds", jobId));
      }
      if (stateFilter !== "all") params.append("state", stateFilter);
      if (mode === "history") {
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());
      }

      const response = await fetch(`/api/job-runs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch runs");

      const data = await response.json();
      setRuns(data.runs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading runs:", error);
      setRuns([]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, pagination.page, pagination.pageSize, categoryFilter, jobFilters, stateFilter, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  // Auto-refresh in live mode
  useEffect(() => {
    if (mode === "live") {
      const interval = setInterval(() => {
        loadRuns();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [mode, loadRuns]);

  // Update filtered jobs when category changes
  useEffect(() => {
    if (categoryFilter !== "all") {
      setFilteredJobs(jobs.filter((job) => job.categoryId === categoryFilter));
      setJobFilters([]); // Reset job filters when category changes
    } else {
      setFilteredJobs(jobs);
    }
  }, [categoryFilter, jobs]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter("all");
    setJobFilters([]);
    setStateFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = categoryFilter !== "all" || jobFilters.length > 0 || stateFilter !== "all" || startDate || endDate;

  const formatDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return "-";
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const duration = end - start;

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
    return `${(duration / 60000).toFixed(2)}min`;
  };

  const viewLog = (run: JobRun) => {
    setSelectedRun(run);
    setShowLogDialog(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "history" | "live")} className="flex-1 flex flex-col">
        {/* Header with mode selector */}
        <div className="border-b bg-background p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Execution History</h2>
              <p className="text-sm text-muted-foreground">
                {pagination.total} total executions
              </p>
            </div>
            <div className="flex gap-2">
              <TabsList>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="live">
                  <Radio className="h-4 w-4 mr-2" />
                  Live
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRuns}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          {mode === "history" && (
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={(value) => {
                setCategoryFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Job Filter - Multi Select */}
              <div className="w-[250px]">
                <MultiSelect
                  options={filteredJobs.map((job) => ({
                    label: job.name,
                    value: job.id,
                  }))}
                  value={jobFilters}
                  onValueChange={(value) => {
                    setJobFilters(value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  placeholder="Select jobs..."
                  searchPlaceholder="Search jobs..."
                  emptyText="No jobs found"
                />
              </div>

              {/* State Filter */}
              <Select value={stateFilter} onValueChange={(value) => {
                setStateFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="OK">Success</SelectItem>
                  <SelectItem value="FAIL">Failed</SelectItem>
                  <SelectItem value="TIMEOUT">Timeout</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="QUEUED">Queued</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="default">
                    <Calendar className="h-4 w-4 mr-2" />
                    {startDate && endDate
                      ? `${format(startDate, "dd/MM")} - ${format(endDate, "dd/MM")}`
                      : "Date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="text-sm font-medium">
                        Start date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setStartDate(date);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm font-medium">
                        End date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setEndDate(date);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="default" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Live mode info */}
          {mode === "live" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Auto-refreshing every 5 seconds</span>
              </div>
              <span>•</span>
              <span>Showing last 30 executions</span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <TabsContent value="history" className="flex-1 overflow-auto p-6 mt-0">
          <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("state")}
                    className="font-semibold"
                  >
                    Status
                    {sortBy === "state" && (
                      sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("job.name")}
                    className="font-semibold"
                  >
                    Job Name
                    {sortBy === "job.name" && (
                      sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("startedAt")}
                    className="font-semibold"
                  >
                    Started At
                    {sortBy === "startedAt" && (
                      sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-[80px]">Attempts</TableHead>
                <TableHead className="w-[100px]">Exit Code</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading runs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No execution history found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => {
                  const StateIcon = stateIcons[run.state];
                  return (
                    <TableRow key={run.id}>
                      <TableCell>
                        <Badge variant="outline" className={stateColors[run.state]}>
                          <StateIcon className={`h-3 w-3 mr-1 ${run.state === "RUNNING" ? "animate-spin" : ""}`} />
                          {run.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{run.job.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {run.job.category?.name || "Uncategorized"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(run.startedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(run.startedAt, run.finishedAt)}
                      </TableCell>
                      <TableCell className="text-center">{run.attempts}</TableCell>
                      <TableCell className="text-center">
                        {run.exitCode !== null ? (
                          <Badge variant={run.exitCode >= 200 && run.exitCode < 300 ? "default" : "destructive"}>
                            {run.exitCode}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewLog(run)}
                          disabled={!run.log}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

          {/* Pagination */}
          {!isLoading && runs.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {pagination.totalPages > 5 && <span className="px-2">...</span>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Live Mode Tab */}
        <TabsContent value="live" className="flex-1 overflow-auto p-6 mt-0">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    <div className="font-semibold">Status</div>
                  </TableHead>
                  <TableHead>
                    <div className="font-semibold">Job Name</div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <div className="font-semibold">Started At</div>
                  </TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-[80px]">Attempts</TableHead>
                  <TableHead className="w-[100px]">Exit Code</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading runs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : runs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No execution history found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.map((run) => {
                    const StateIcon = stateIcons[run.state];
                    return (
                      <TableRow key={run.id}>
                        <TableCell>
                          <Badge variant="outline" className={stateColors[run.state]}>
                            <StateIcon className={`h-3 w-3 mr-1 ${run.state === "RUNNING" ? "animate-spin" : ""}`} />
                            {run.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{run.job.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {run.job.category?.name || "Uncategorized"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(run.startedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDuration(run.startedAt, run.finishedAt)}
                        </TableCell>
                        <TableCell className="text-center">{run.attempts}</TableCell>
                        <TableCell className="text-center">
                          {run.exitCode !== null ? (
                            <Badge variant={run.exitCode >= 200 && run.exitCode < 300 ? "default" : "destructive"}>
                              {run.exitCode}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewLog(run)}
                            disabled={!run.log}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Viewer Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Execution Log</DialogTitle>
            <DialogDescription>
              {selectedRun && (
                <>
                  {selectedRun.job.name} -{" "}
                  {format(new Date(selectedRun.startedAt), "dd/MM/yyyy HH:mm:ss")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 bg-muted rounded-lg text-xs font-mono whitespace-pre-wrap">
              {selectedRun?.log || "No log available"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
