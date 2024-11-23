export interface UserCastMemberStatus {
  hasPhoto: boolean
  hasAuto: boolean
}

export interface UserCastMemberState {
  [castMemberId: string]: UserCastMemberStatus
}
