import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

export const Route = createFileRoute('/explore')({
  component: ExploreComponent,
})

export default function ExploreComponent() {
  return (
    <div className="p-2">
      <h3>Explore</h3>

    </div>
  )
}