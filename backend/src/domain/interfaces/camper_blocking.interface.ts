export interface CamperBlocking {
  id: string;
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface CreateCamperBlockingDto {
  camper_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}
