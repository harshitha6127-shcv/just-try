import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, PriorityLevel } from '../types';
import { TaskModal } from '../components/TaskModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KanbanView } from '../components/KanbanView';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  List,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks, members, projects, user, addTask, updateTask, deleteTask, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'today' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [projectFilter, setProjectFilter] = useState<string>('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('TODO');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'my') {
        const myMember = members.find((m) => m.email === user?.email);
        if (t.assignedTo !== myMember?.id && t.assignedTo !== user?.id) return false;
      } else if (activeTab === 'today') {
        if (t.dueDate !== todayStr) return false;
      } else if (activeTab === 'completed') {
        if (t.status !== 'COMPLETED') return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesProject = projectFilter === 'All' || t.projectId === projectFilter;

      return matchesQuery && matchesPriority && matchesProject;
    });
  }, [tasks, activeTab, searchQuery, priorityFilter, projectFilter, members, user, todayStr]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = (task: Task, nextStatus: TaskStatus) => {
    updateTask({ ...task, status: nextStatus });
    const statusLabel =
      nextStatus === 'TODO'
        ? 'To Do'
        : nextStatus === 'IN_PROGRESS'
        ? 'In Progress'
        : nextStatus === 'REVIEW'
        ? 'Review'
        : 'Completed';
    addToast(`Moved "${task.title}" to ${statusLabel}`, 'info');
  };

  return (
    <div id="tasks-page" className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize assignments across your projects ({tasks.length} total).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTaskToEdit(null);
            setDefaultStatusForNew('TODO');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'my', label: 'My Tasks' },
            { id: 'today', label: 'Due Today' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="relative flex-1 md:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded p-0.5 bg-slate-100 dark:bg-slate-800/60 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban View"
            >
              <Kanban className="w-3 h-3" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3 h-3" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban or List */}
      {viewMode === 'kanban' ? (
        <KanbanView
          tasks={filteredTasks}
          projects={projects}
          members={members}
          onStatusChange={handleStatusChange}
          onEditTask={handleEdit}
          onDeleteTask={(task) => setTaskToDelete(task)}
          onAddTask={(status) => {
            setTaskToEdit(null);
            setDefaultStatusForNew(status);
            setIsModalOpen(true);
          }}
          selectedProjectId={projectFilter}
          onSelectProject={(pId) => setProjectFilter(pId)}
        />
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/75 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2 px-3">Task</th>
                <th className="py-2 px-3">Project</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Assignee</th>
                <th className="py-2 px-3">Due</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assignedTo);
                const project = projects.find((p) => p.id === task.projectId);

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {task.description}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {project?.name || '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {assignee?.name || 'Unassigned'}
                    </td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                      {task.dueDate}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(task)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForNew}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={(data) => {
          if (taskToEdit) {
            updateTask({ ...taskToEdit, ...data });
          } else {
            addTask(data);
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
