// client/src/components/home/TopicInput.tsx
import React from 'react';
import FormField from '../common/FormField';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const EXAMPLE_TOPICS = [
  'React.js',
  'Python',
  'Machine Learning',
  'Data Structures',
  'Cybersecurity',
  'Mathematics',
];

export default function TopicInput({ value, onChange, error }: TopicInputProps) {
  return (
    <div className="w-full">
      <FormField
        id="topic"
        label="Subject"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a subject to assess..."
        error={error}
        helperText="Be specific for best results"
        required
      />

      {/* Example topics - Minimal button style */}
      {!value && (
        <div className="mt-lg">
          <p className="text-label text-text-tertiary mb-md">Try:</p>
          <div className="flex flex-wrap gap-sm">
            {EXAMPLE_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onChange(topic)}
                className="inline-flex items-center rounded-sm border border-border-light bg-white px-md py-xs text-body-sm font-medium text-text-primary hover:bg-surface-light hover:border-border-dark transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}