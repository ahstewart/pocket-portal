export default function LoadingCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 animate-pulse ${className}`}>
      {/* Image skeleton */}
      <div className="w-full h-40 bg-slate-200 rounded-lg mb-4" />
      
      {/* Category badge skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-5/6 bg-slate-200 rounded" />
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-slate-200 rounded" />
          <div className="h-4 w-12 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
