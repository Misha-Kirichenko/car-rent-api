import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class QueryBuilder {
  conn: any;
  constructor(private config: ConfigService) {
    this.conn = new Pool({
      user: this.config.get('DB_USER'),
      host: this.config.get('DB_HOST'),
      database: this.config.get('DB_NAME'),
      password: this.config.get('DB_PASSWORD'),
      port: this.config.get('DB_PORT'),
    });
  }

  async runQuery(query: string) {
    try {
      const res = await this.conn.query(query);
      return res.command === 'SELECT' ? res.rows : res.rowCount;
    } catch ({ message: msg }) {
      throw new BadRequestException({ msg });
    }
  }
}
