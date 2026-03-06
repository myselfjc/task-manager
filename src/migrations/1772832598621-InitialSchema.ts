import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772832598621 implements MigrationInterface {
  name = "InitialSchema1772832598621";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`tasks\` (
        \`id\` varchar(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`status\` enum('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
        \`due_date\` date NOT NULL,
        \`owner_id\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        \`is_deleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`tasks\`
        ADD CONSTRAINT \`FK_0631c1eb8316f8af361cf14eb85\`
        FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`)
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
        DROP FOREIGN KEY \`FK_0631c1eb8316f8af361cf14eb85\`
    `);
    await queryRunner.query(`
      DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\`
    `);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`tasks\``);
  }
}
