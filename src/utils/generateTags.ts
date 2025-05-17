export function generateTags(title: string, role: string): string[] {
    const keywords = `${title} ${role}`.toLowerCase();
    const tags: Set<string> = new Set();
  
    if (keywords.includes("prayer")) tags.add("prayer");
    if (keywords.includes("worship")) tags.add("worship");
    if (keywords.includes("bible")) tags.add("bible");
    if (keywords.includes("healing")) tags.add("healing");
    if (keywords.includes("host")) tags.add("leadership");
    if (keywords.includes("guest")) tags.add("guest");
  
    return [...tags];
  }
  