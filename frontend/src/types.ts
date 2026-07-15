// Shared API response shapes — one definition, imported everywhere.
// NOTE: the backend serializes Decimal columns as JSON strings (Pydantic default),
// so money fields are typed `string` here and parsed with parseFloat at use sites.

export interface IssueType {
  id: number
  label: string
}

export interface CardOut {
  id: string
  batch_id: string
  pokemon_name: string
  set_string: string
  raw_value: string
  target_grade: number
  actual_grade: number | null
  graded_value: string | null
  confidence: number
  front_photo_key: string | null
  back_photo_key: string | null
  issue_types: IssueType[]
}

export interface Batch {
  id: string
  user_id: string
  name: string
  grading_company: string
  status: string
  fees_upfront: string
  fees_after: string | null
  submitted_at: string
  returned_at: string | null
  card_count: number
  net_profit: string
}

export interface BatchDetail extends Batch {
  cards: CardOut[]
}

export interface HighestProfitCard {
  pokemon_name: string
  profit: string
}

export interface SummaryOut {
  net_grading_profit: string
  cards_graded: number
  total_batches: number
  grade_hit_rate: number
  highest_profit_card: HighestProfitCard | null
}
