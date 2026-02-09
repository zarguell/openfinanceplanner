import type {
  Milestone,
  MilestoneType,
  MilestoneCondition,
  Event,
  EventType,
  RecurrenceFrequency,
  FinancialImpact,
  ConditionType,
  ComparisonOperator,
} from '../types';

/**
 * Parameters for creating a milestone
 */
export type CreateMilestoneParams = {
  name: string;
  type: MilestoneType;
  targetDate: string;
  conditions?: MilestoneCondition[];
  description?: string;
  financialImpact?: FinancialImpact;
  priority?: number;
};

/**
 * Parameters for creating an event
 */
export type CreateEventParams = {
  type: EventType;
  name: string;
  date: string;
  amount: number;
  recurring?: boolean;
  frequency?: RecurrenceFrequency;
  endDate?: string;
  description?: string;
  category?: string;
  tags?: ReadonlyArray<string>;
};

/**
 * Validates if a string is a valid date
 */
const isValidDateString = (dateString: string): boolean => {
  return !isNaN(Date.parse(dateString));
};

/**
 * Validates milestone type
 */
const isValidMilestoneType = (type: string): type is MilestoneType => {
  const validTypes: MilestoneType[] = [
    'retirement',
    'career-change',
    'asset-purchase',
    'asset-sale',
    'family-change',
    'other-milestone',
  ];
  return validTypes.includes(type as MilestoneType);
};

/**
 * Validates condition type
 */
const isValidConditionType = (type: string): boolean => {
  const validTypes: ConditionType[] = [
    'age',
    'net-worth',
    'savings-rate',
    'debt-ratio',
    'date',
  ];
  return validTypes.includes(type as ConditionType);
};

/**
 * Validates comparison operator
 */
const isValidOperator = (operator: string): operator is ComparisonOperator => {
  const validOperators: ComparisonOperator[] = [
    '>',
    '>=',
    '<',
    '<=',
    '==',
    '!=',
  ];
  return validOperators.includes(operator as ComparisonOperator);
};

/**
 * Creates a new milestone with a unique ID
 */
export const createMilestone = (params: CreateMilestoneParams): Milestone => {
  const id = `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name: params.name,
    type: params.type,
    targetDate: params.targetDate,
    completed: false,
    conditions: params.conditions ?? [],
    description: params.description,
    financialImpact: params.financialImpact,
    priority: params.priority,
  };
};

/**
 * Creates a new event with a unique ID
 */
export const createEvent = (params: CreateEventParams): Event => {
  const id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    type: params.type,
    name: params.name,
    date: params.date,
    amount: params.amount,
    recurring: params.recurring ?? false,
    frequency: params.frequency,
    endDate: params.endDate,
    description: params.description,
    category: params.category,
    tags: params.tags,
  };
};

/**
 * Validates a milestone
 */
export const validateMilestone = (milestone: Milestone): boolean => {
  if (!milestone.id || milestone.id.trim() === '') {
    return false;
  }

  if (!milestone.name || milestone.name.trim() === '') {
    return false;
  }

  if (!isValidMilestoneType(milestone.type)) {
    return false;
  }

  if (!isValidDateString(milestone.targetDate)) {
    return false;
  }

  if (milestone.financialImpact) {
    if (!validateFinancialImpact(milestone.financialImpact)) {
      return false;
    }
  }

  if (milestone.conditions && milestone.conditions.length > 0) {
    for (const condition of milestone.conditions) {
      if (!validateMilestoneCondition(condition)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Validates a milestone condition
 */
export const validateMilestoneCondition = (
  condition: MilestoneCondition
): boolean => {
  if (!isValidConditionType(condition.type)) {
    return false;
  }

  if (!isValidOperator(condition.operator)) {
    return false;
  }

  if (condition.type === 'date') {
    if (
      typeof condition.value !== 'string' ||
      !isValidDateString(condition.value)
    ) {
      return false;
    }
  } else if (typeof condition.value !== 'number') {
    return false;
  }

  return true;
};

/**
 * Validates financial impact
 */
export const validateFinancialImpact = (impact: FinancialImpact): boolean => {
  if (impact.amount < 0) {
    return false;
  }

  if (impact.recurring && !impact.frequency) {
    return false;
  }

  return true;
};

/**
 * Validates an event
 */
export const validateEvent = (event: Event): boolean => {
  if (!event.id || event.id.trim() === '') {
    return false;
  }

  if (!event.name || event.name.trim() === '') {
    return false;
  }

  if (event.type !== 'income' && event.type !== 'expense') {
    return false;
  }

  if (!isValidDateString(event.date)) {
    return false;
  }

  if (event.amount < 0) {
    return false;
  }

  if (event.recurring && !event.frequency) {
    return false;
  }

  if (event.recurring && event.endDate && !isValidDateString(event.endDate)) {
    return false;
  }

  if (event.endDate && new Date(event.endDate) < new Date(event.date)) {
    return false;
  }

  return true;
};

/**
 * Checks if milestone conditions are met
 */
export const areMilestoneConditionsMet = (
  conditions: ReadonlyArray<MilestoneCondition>,
  currentState: {
    age?: number;
    netWorth?: number;
    savingsRate?: number;
    debtRatio?: number;
    currentDate?: string;
  }
): boolean => {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every((condition) => {
    const { type, operator, value } = condition;

    switch (type) {
      case 'age':
        return compareValues(currentState.age ?? 0, value as number, operator);
      case 'net-worth':
        return compareValues(
          currentState.netWorth ?? 0,
          value as number,
          operator
        );
      case 'savings-rate':
        return compareValues(
          currentState.savingsRate ?? 0,
          value as number,
          operator
        );
      case 'debt-ratio':
        return compareValues(
          currentState.debtRatio ?? 0,
          value as number,
          operator
        );
      case 'date':
        return compareDates(
          currentState.currentDate ?? '',
          value as string,
          operator
        );
      default:
        return false;
    }
  });
};

/**
 * Compares two values based on an operator
 */
const compareValues = (
  actual: number,
  expected: number,
  operator: ComparisonOperator
): boolean => {
  switch (operator) {
    case '>':
      return actual > expected;
    case '>=':
      return actual >= expected;
    case '<':
      return actual < expected;
    case '<=':
      return actual <= expected;
    case '==':
      return actual === expected;
    case '!=':
      return actual !== expected;
    default:
      return false;
  }
};

/**
 * Compares two dates based on an operator
 */
const compareDates = (
  actual: string,
  expected: string,
  operator: ComparisonOperator
): boolean => {
  const actualDate = new Date(actual);
  const expectedDate = new Date(expected);

  const actualTime = actualDate.getTime();
  const expectedTime = expectedDate.getTime();

  return compareValues(actualTime, expectedTime, operator);
};

/**
 * Sorts milestones by priority (lower number = higher priority) and target date
 */
export const sortMilestones = (
  milestones: ReadonlyArray<Milestone>
): Milestone[] => {
  return [...milestones].sort((a, b) => {
    if (a.priority !== undefined && b.priority !== undefined) {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
    } else if (a.priority !== undefined) {
      return -1;
    } else if (b.priority !== undefined) {
      return 1;
    }

    const dateA = new Date(a.targetDate).getTime();
    const dateB = new Date(b.targetDate).getTime();

    return dateA - dateB;
  });
};

/**
 * Filters milestones by completion status
 */
export const filterMilestonesByCompletion = (
  milestones: ReadonlyArray<Milestone>,
  completed: boolean
): Milestone[] => {
  return milestones.filter((m) => m.completed === completed);
};

/**
 * Filters milestones by type
 */
export const filterMilestonesByType = (
  milestones: ReadonlyArray<Milestone>,
  type: MilestoneType
): Milestone[] => {
  return milestones.filter((m) => m.type === type);
};

/**
 * Sorts events by date
 */
export const sortEventsByDate = (events: ReadonlyArray<Event>): Event[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
};

/**
 * Filters events by type
 */
export const filterEventsByType = (
  events: ReadonlyArray<Event>,
  type: EventType
): Event[] => {
  return events.filter((e) => e.type === type);
};

/**
 * Filters events by date range
 */
export const filterEventsByDateRange = (
  events: ReadonlyArray<Event>,
  startDate: string,
  endDate: string
): Event[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return events.filter((e) => {
    const eventDate = new Date(e.date).getTime();
    return eventDate >= start && eventDate <= end;
  });
};
