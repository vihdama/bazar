import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toast } = useToast();

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
        toast.visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 pointer-events-none -translate-y-2.5'
      }`}
    >
      <i className={`fa-solid ${toast.icon}`}></i>
      <span>{toast.message}</span>
    </div>
  );
}
