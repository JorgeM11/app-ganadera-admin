import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Boneyard Primitive Bone
 */
export function Bone({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-neutral-200/75',
        className
      )}
      {...props}
    />
  );
}

/**
 * Boneyard Table Skeleton
 */
export function BoneyardTableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden p-4 space-y-4">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-100">
        <Bone className="h-9 w-48 sm:w-64" />
        <div className="flex gap-2">
          <Bone className="h-9 w-24" />
          <Bone className="h-9 w-28" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center justify-between gap-4 py-3 px-2 border-b border-neutral-100/60 last:border-none"
          >
            <div className="flex items-center gap-3">
              <Bone className="w-10 h-10 rounded-2xl" />
              <div className="space-y-1.5">
                <Bone className="h-4 w-32" />
                <Bone className="h-3 w-20" />
              </div>
            </div>
            <Bone className="h-4 w-28 hidden sm:block" />
            <Bone className="h-4 w-24 hidden md:block" />
            <Bone className="h-6 w-20 rounded-full" />
            <div className="flex gap-1">
              <Bone className="h-8 w-8 rounded-lg" />
              <Bone className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Boneyard Stat Cards Skeleton
 */
export function BoneyardCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-16" />
            </div>
            <Bone className="w-12 h-12 rounded-2xl" />
          </div>
          <div className="pt-2 border-t border-neutral-100 flex justify-between">
            <Bone className="h-3 w-24" />
            <Bone className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Boneyard Detail Profile Skeleton
 */
export function BoneyardDetailsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bone className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Bone className="h-6 w-48" />
            <Bone className="h-3 w-32" />
          </div>
        </div>
        <Bone className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-4">
          <Bone className="w-full aspect-4/3 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-20 rounded-2xl" />
            <Bone className="h-20 rounded-2xl" />
          </div>
        </div>
        <div className="md:col-span-7 space-y-4">
          <Bone className="h-44 rounded-3xl" />
          <Bone className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
