import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async attendance(from?: string, to?: string, coachId?: string) {
    const start = from ?? '2000-01-01';
    const end = to ?? '2999-12-31';
    const params: unknown[] = ['PRESENT', 'ABSENT', 'LATE', start, end];
    let coachFilter = '';
    if (coachId) {
      params.push(coachId);
      coachFilter = ' AND tg.coach_id = $6';
    }

    return this.dataSource.query(
      'SELECT p.id, p.player_code, p.first_name_fa, p.last_name_fa, COUNT(ar.id) FILTER (WHERE ar.status = $1) AS present, COUNT(ar.id) FILTER (WHERE ar.status = $2) AS absent, COUNT(ar.id) FILTER (WHERE ar.status = $3) AS late FROM players p INNER JOIN attendance_records ar ON ar.player_id = p.id INNER JOIN training_sessions ts ON ts.id = ar.training_session_id INNER JOIN training_groups tg ON tg.id = ts.training_group_id WHERE ts.session_date BETWEEN $4 AND $5' + coachFilter + ' GROUP BY p.id ORDER BY p.first_name_fa',
      params,
    );
  }

  async playersSummary() {
    return this.dataSource.query(
      'SELECT COUNT(*)::int AS total_players, COUNT(*) FILTER (WHERE status = $1)::int AS active_players, COUNT(*) FILTER (WHERE status = $2)::int AS pending_players FROM players',
      ['ACTIVE', 'PENDING'],
    );
  }

  async performance(playerId: string, userId: string, role: string) {
    if (role === 'PARENT') {
      const allowed = await this.dataSource.query(
        'SELECT 1 FROM player_guardians pg INNER JOIN guardians g ON g.id = pg.guardian_id WHERE pg.player_id = $1 AND g.user_id = $2 LIMIT 1',
        [playerId, userId],
      );
      if (!allowed.length) throw new ForbiddenException('You cannot access this player');
    }

    if (role === 'COACH') {
      const playerScope = await this.dataSource.query(
        'SELECT 1 FROM players p INNER JOIN coaches c ON c.id = p.responsible_coach_id INNER JOIN users u ON u.id = c.user_id WHERE p.id = $1 AND u.id = $2 LIMIT 1',
        [playerId, userId],
      );
      if (!playerScope.length) throw new ForbiddenException('You cannot access this player');
    }

    const [attendance, assessments, progress] = await Promise.all([
      this.dataSource.query(
        'SELECT status, COUNT(*)::int AS count FROM attendance_records WHERE player_id = $1 GROUP BY status',
        [playerId],
      ),
      this.dataSource.query(
        'SELECT assessed_at, vertical_jump_cm, speed_score, passing_score, reception_score, setting_score, serving_score, attack_score, block_score, defense_score, strength_score FROM player_assessments WHERE player_id = $1 ORDER BY assessed_at ASC',
        [playerId],
      ),
      this.dataSource.query(
        'SELECT period_start, period_end, physical_notes, technical_notes, psychological_notes, general_notes FROM progress_reports WHERE player_id = $1 ORDER BY period_end DESC',
        [playerId],
      ),
    ]);

    return { attendance, assessments, progress };
  }
}
