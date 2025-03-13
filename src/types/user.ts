export interface UserCastMemberStatus {
  wantsPhoto: boolean
  wantsAuto: boolean
  hasPhoto: boolean
  hasAuto: boolean
}

export interface UserCastMemberState {
  [castMemberId: string]: UserCastMemberStatus
}
