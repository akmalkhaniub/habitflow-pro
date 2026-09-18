export const theme = {
  colors: {
    bg: '#0B1020',
    surface: '#151B2E',
    surfaceAlt: '#1E2740',
    border: '#2A3350',
    text: '#F5F7FF',
    textMuted: '#9AA6C8',
    primary: '#6C8CFF',
    primaryText: '#0B1020',
    success: '#3ED598',
    warning: '#FFB020',
    danger: '#FF5C7A',
    gold: '#FFD166'
  },
  radius: { sm: 8, md: 14, lg: 22 },
  spacing: (n: number) => n * 8
} as const;

export const categoryColor: Record<string, string> = {
  focus: '#6C8CFF',
  health: '#3ED598',
  learning: '#FFB020',
  mindfulness: '#C792EA',
  general: '#9AA6C8'
};
