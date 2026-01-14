import { Activity, EnergyLevel, Priority, CoachSuggestion } from '@/lib/types'

/**
 * Core coaching algorithm that selects activities based on energy level and priority
 */
export function selectActivities(
  activities: Activity[],
  energyLevel: EnergyLevel,
  sessionType: 'morning' | 'afternoon'
): CoachSuggestion {
  // Filter activities by energy capacity
  const energyMap = { low: 1, medium: 2, high: 3 }
  const currentEnergy = energyMap[energyLevel]

  const availableActivities = activities.filter(
    (activity) => energyMap[activity.effort_level] <= currentEnergy
  )

  if (availableActivities.length === 0) {
    return {
      mainActivity: null,
      quote: "Rest is also a practice. Sometimes the best activity is to pause.",
      reflectionPrompt: "What would it feel like to honor your current energy level?"
    }
  }

  // Priority mapping for selection
  const priorityMap = { high: 3, medium: 2, low: 1 }

  // Sort by priority (high first), then by effort (lower effort preferred when same priority)
  const sortedActivities = [...availableActivities].sort((a, b) => {
    const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // If same priority, prefer lower effort
    return energyMap[a.effort_level] - energyMap[b.effort_level]
  })

  // Selection rules:
  // - Medium/High energy: Favor High Priority tasks
  // - Low energy: Can handle any priority, but still prioritize High Priority when possible
  // - Only suggest Low Priority ("luxury") tasks if energy allows and no higher priority task is more suitable

  let mainActivity: Activity | null = null

  if (energyLevel === 'high' || energyLevel === 'medium') {
    // For medium/high energy, prioritize high priority tasks
    const highPriorityActivities = sortedActivities.filter(a => a.priority === 'high')
    if (highPriorityActivities.length > 0) {
      mainActivity = highPriorityActivities[0]
    } else {
      // No high priority available, take best available
      mainActivity = sortedActivities[0]
    }
  } else {
    // Low energy: can handle any priority, but still prefer high when available
    mainActivity = sortedActivities[0]
  }

  // Get appropriate quote and reflection
  const quote = getQuote(energyLevel, mainActivity?.priority)
  const reflectionPrompt = getReflectionPrompt(energyLevel, sessionType)

  return {
    mainActivity,
    quote,
    reflectionPrompt
  }
}

function getQuote(energyLevel: EnergyLevel, priority?: Priority): string {
  if (energyLevel === 'low') {
    return "Gentle steps forward are still progress. Honor where you are."
  }

  if (priority === 'high') {
    return "What matters most deserves your attention. Start with intention."
  }

  if (priority === 'low') {
    return "Luxury tasks are valid too. What brings you joy today?"
  }

  return "Each moment is a choice. What feels right for you now?"
}

function getReflectionPrompt(energyLevel: EnergyLevel, sessionType: 'morning' | 'afternoon'): string {
  if (sessionType === 'morning') {
    if (energyLevel === 'high') {
      return "How do you want to channel this energy today?"
    } else if (energyLevel === 'medium') {
      return "What would make this morning feel meaningful?"
    } else {
      return "What gentle start would serve you best?"
    }
  } else {
    if (energyLevel === 'high') {
      return "What would you like to accomplish with this afternoon?"
    } else if (energyLevel === 'medium') {
      return "How can you make the most of this time?"
    } else {
      return "What would feel restorative right now?"
    }
  }
}
