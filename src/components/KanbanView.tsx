import React, { useState } from 'react';
import { Task, TaskStatus, Project, TeamMember } from '../types';
import {
  GripVertical,
  Calendar,
  User,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDot,
  Layers,
  Sparkles,
  Kanban as KanbanIcon,
} from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  members: TeamMember[];
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  sublabel: string;
  colorClass: string;
  badgeClass: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'TODO',
    label: 'To Do',
    sublabel: 'Backlog & Planned',
    colorClass: 'border-slate-300 dark:border-slate-700',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dotColor: 'bg-slate-400',
    icon: CircleDot,
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    sublabel: 'Active Execution',
    colorClass: 'border-amber-300 dark:border-amber-700/60',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    icon: Clock,
  },
  {
    id: 'REVIEW',
    label: 'Review',
    sublabel: 'QA & Verification',
    colorClass: 'border-indigo-300 dark:border-indigo-700/60',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    dotColor: 'bg-indigo-500',
    icon: Sparkles,
  },
  {
    id: 'COMPLETED',
    label: 'Completed',
    sublabel: 'Delivered & Done',
    colorClass: 'border-emerald-300 dark:border-emerald-700/60',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle2,
  },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  members,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddTask,
  selectedProjectId = 'All',
  onSelectProject,
}) => {
  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for workflow status shifting via buttons
  const getStatusFlow = (current: TaskStatus): { prev?: TaskStatus; next?: TaskStatus } => {
    switch (current) {
      case 'TODO':
        return { next: 'IN_PROGRESS' };
      case 'IN_PROGRESS':
        return { prev: 'TODO', next: 'REVIEW' };
      case 'REVIEW':
        return { prev: 'IN_PROGRESS', next: 'COMPLETED' };
      case 'COMPLETED':
        return { prev: 'REVIEW' };
      default:
        return {};
    }
  };

  // Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: TaskStatus) => {
    // Only reset if leaving this column's container
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status !== targetStatus) {
      onStatusChange(task, targetStatus);
    }

    setDraggedTaskId(null);
  };

  // Compute Workflow Progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div id="kanban-workflow-component" className="space-y-3">
      {/* Workflow Visualizer Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KanbanIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Project Workflow Pipeline
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {completionPercentage}% Complete
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Drag and drop task cards across columns to update workflow statuses instantaneously.
              </p>
            </div>
          </div>

          {/* Workflow Stage Progress Multi-Bar */}
          <div className="flex flex-col items-end gap-1 min-w-[200px]">
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>To Do: {todoTasks}</span>
              <span>In Prog: {inProgressTasks}</span>
              <span>Review: {reviewTasks}</span>
              <span>Done: {completedTasks}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              {totalTasks > 0 ? (
                <>
                  <div
                    style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                    className="h-full bg-slate-400 transition-all duration-300"
                    title={`To Do: ${todoTasks}`}
                  />
                  <div
                    style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`In Progress: ${inProgressTasks}`}
                  />
                  <div
                    style={{ width: `${(reviewTasks / totalTasks) * 100}%` }}
                    className="h-full bg-indigo-500 transition-all duration-300"
                    title={`Review: ${reviewTasks}`}
                  />
                  <div
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                    title={`Completed: ${completedTasks}`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
              )}
            </div>
          </div>
        </div>

        {/* Project Pipeline Filter Pills (if onSelectProject is provided) */}
        {onSelectProject && projects.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-[11px]">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold shrink-0">
              Workflow:
            </span>
            <button
              type="button"
              onClick={() => onSelectProject('All')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                selectedProjectId === 'All'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Projects ({tasks.length})
            </button>
            {projects.map((p) => {
              const count = tasks.filter((t) => t.projectId === p.id).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 ${
                    selectedProjectId === p.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{p.name}</span>
                  <span className="text-[9px] opacity-80 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4-Column Drag and Drop Kanban Board */}
      <div
        id="kanban-columns-grid"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start"
      >
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              id={`kanban-column-${col.id}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col min-h-[460px] rounded p-2.5 transition-all duration-150 border ${
                isOver
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 px-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {col.label}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${col.badgeClass}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  id={`add-task-to-${col.id}`}
                  onClick={() => onAddTask(col.id)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drag Over Active Target Banner */}
              {isOver && (
                <div className="mb-2 py-1.5 px-2 bg-indigo-100/80 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 border-dashed rounded text-center text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 animate-pulse">
                  Drop to move task to {col.label}
                </div>
              )}

              {/* Tasks Stack */}
              <div className="space-y-2 flex-1 overflow-y-auto min-h-[360px]">
                {colTasks.length === 0 ? (
                  <div
                    className={`h-48 border border-dashed rounded flex flex-col items-center justify-center p-4 text-center transition-colors ${
                      isOver
                        ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5 opacity-40" />
                    <p className="text-xs font-medium">No tasks in {col.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      Drag cards here or click + to add
                    </p>
                    <button
                      type="button"
                      onClick={() => onAddTask(col.id)}
                      className="mt-2.5 px-2 py-1 text-[11px] font-medium rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-300 shadow-2xs"
                    >
                      + Add Task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = members.find((m) => m.id === task.assignedTo);
                    const project = projects.find((p) => p.id === task.projectId);
                    const isDragging = draggedTaskId === task.id;
                    const { prev, next } = getStatusFlow(task.status);
                    const isOverdue =
                      task.dueDate && task.dueDate < todayStr && task.status !== 'COMPLETED';

                    return (
                      <div
                        key={task.id}
                        id={`kanban-task-card-${task.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-slate-800/90 border rounded p-2.5 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group select-none relative ${
                          isDragging
                            ? 'opacity-40 scale-95 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-400/30'
                            : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* Top Row: Project Tag, Drag Handle & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                              {project?.name || 'General'}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              task.priority === 'Critical'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                : task.priority === 'High'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                : task.priority === 'Medium'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                          {task.title}
                        </h4>

                        {/* Description (if provided) */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                            {task.description}
                          </p>
                        )}

                        {/* Due Date Indicator */}
                        {task.dueDate && (
                          <div
                            className={`flex items-center gap-1 text-[10px] mb-2 font-mono ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isOverdue ? (
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                            ) : (
                              <Calendar className="w-3 h-3" />
                            )}
                            <span>Due {task.dueDate}</span>
                            {isOverdue && <span>(Overdue)</span>}
                          </div>
                        )}

                        {/* Footer: Assignee Avatar & Actions */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-400">
                          {/* Assignee */}
                          <div className="flex items-center gap-1.5 truncate">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                              {assignee ? assignee.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="truncate max-w-[80px] text-[10px] text-slate-600 dark:text-slate-400">
                              {assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          {/* Quick Status Shift & Edit Buttons */}
                          <div className="flex items-center gap-0.5">
                            {prev && (
                              <button
                                type="button"
                                onClick={() => onStatusChange(task, prev)}
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title={`Move backward to ${prev}`}
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {next && (
                              <button
                                type="button"
                                onClick={() => onStatusChange(task, next)}
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title={`Advance forward to ${next}`}
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onEditTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Edit Task"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
