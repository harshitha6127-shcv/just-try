import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Project, PriorityLevel, ProjectStatus } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  User,
  Users,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, members, addProject, updateProject, deleteProject } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesQuery && matchesPriority && matchesStatus;
    });
  }, [projects, searchQuery, priorityFilter, statusFilter]);

  const handleEdit = (proj: Project) => {
    setProjectToEdit(proj);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleQuickProgress = (proj: Project, delta: number) => {
    const newProgress = Math.min(100, Math.max(0, proj.progress + delta));
    const newStatus: ProjectStatus =
      newProgress === 100 ? 'Completed' : proj.status === 'Completed' ? 'Active' : proj.status;
    updateProject({ ...proj, progress: newProgress, status: newStatus });
  };

  return (
    <div id="projects-page" className="p-3 sm:p-4 lg:p-5 max-w-7xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Projects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plan and track your team&apos;s work ({projects.length} total).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setProjectToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter & View Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded p-0.5 bg-slate-100 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-12 text-center text-xs text-slate-400 space-y-2">
          <FolderKanban className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery || priorityFilter !== 'All' || statusFilter !== 'All'
              ? 'No projects match your current filters.'
              : 'No projects created in this workspace yet.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('All');
              setStatusFilter('All');
              setIsModalOpen(true);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            + Create your first project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((proj) => {
            const owner = members.find((m) => m.id === proj.ownerId);

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      {proj.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                          proj.priority === 'Critical'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                            : proj.priority === 'High'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {proj.priority}
                      </span>
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {proj.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Progress Bar & Buttons */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        Progress
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {proj.progress}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickProgress(proj, 10)}
                          className="text-[10px] text-slate-400 hover:text-indigo-600 font-mono px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="+10% Progress"
                        >
                          +10%
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{proj.deadline}</span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(proj)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(proj)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/75 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2 px-3">Project</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Progress</th>
                <th className="py-2 px-3">Deadline</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {proj.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {proj.description}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {proj.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                    {proj.deadline}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(proj)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(proj)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        projectToEdit={projectToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={(data) => {
          if (projectToEdit) {
            updateProject({ ...projectToEdit, ...data });
          } else {
            addProject(data);
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete project?"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? Associated tasks will remain in your workspace.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
