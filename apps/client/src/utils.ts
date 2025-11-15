export function getTabProps(index: number) {
  return {
    id: `navigation-tab-${index}`,
    'aria-controls': `navigation-tabpanel-${index}`,
  };
}