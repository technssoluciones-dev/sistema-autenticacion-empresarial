# Fase 3 - infrastructure + presentation (TypeORM + bcrypt) + fix app.module.spec.ts
# Ejecutar desde la raiz del proyecto: D:\Proyectos\Sistema-Autenticacion-Empresarial

npm install bcrypt
npm install -D @types/bcrypt

New-Item -ItemType Directory -Force -Path `
  "src", `
  "src\infrastructure\database", `
  "src\modules\users", `
  "src\modules\users\infrastructure\persistence", `
  "src\modules\users\infrastructure\services", `
  "src\modules\users\presentation\controllers", `
  "src\modules\users\presentation\dtos"

@'
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Conexión a PostgreSQL vía TypeORM. Mismo patrón que `LoggerModule`:
 * un `forRootAsync` que lee la config ya validada por Joi
 * (`env.validation.ts`) en vez de leer `process.env` directamente acá.
 *
 * `synchronize` NUNCA se deriva directamente de `DB_SYNC` en producción,
 * aunque alguien lo deje en `true` en el `.env` de un servidor real:
 * `synchronize: true` en producción puede borrar o alterar columnas con
 * datos reales sin pasar por una migración revisada. Se fuerza `false`
 * fuera de `development`/`test` sin excepción.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        const isProduction = env === 'production';
        const sync = configService.get<boolean>('database.sync') ?? false;

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: isProduction ? false : sync,
          logging: configService.get<boolean>('database.logging') ?? false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}

'@ | Out-File -Encoding utf8 "src\infrastructure\database\database.module.ts"

@'
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Modelo de persistencia (TypeORM). Deliberadamente separado de la
 * entidad de dominio `User` — esta clase solo describe la tabla, no
 * tiene comportamiento de negocio. `UserPersistenceMapper` traduce entre
 * ambas en las dos direcciones.
 *
 * `id` es `uuid` con valor asignado por dominio (no `@PrimaryGeneratedColumn`
 * autoincremental ni `uuid` generado por la base): el aggregate `User` ya
 * crea su propio `UniqueEntityId` al construirse, y este modelo solo lo
 * persiste tal cual llega.
 */
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\persistence\user.orm-entity.ts"

@'
import { UniqueEntityId } from '@shared/domain';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserOrmEntity } from './user.orm-entity';

/**
 * Traduce entre `UserOrmEntity` (infrastructure) y `User` (domain) en
 * ambas direcciones. `toDomain` usa `User.reconstitute()`, no
 * `User.register()` — leer un usuario de la base no es "registrarlo" de
 * nuevo, así que no debe disparar `UserRegisteredEvent` cada vez que se
 * hace un `findByEmail`.
 */
export class UserPersistenceMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return User.reconstitute(
      {
        email: Email.create(ormEntity.email),
        password: Password.fromHash(ormEntity.passwordHash),
        fullName: ormEntity.fullName,
        isActive: ormEntity.isActive,
        createdAt: ormEntity.createdAt,
      },
      UniqueEntityId.create(ormEntity.id),
    );
  }

  static toPersistence(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = user.id.toString();
    ormEntity.email = user.email.value;
    ormEntity.passwordHash = user.password.hash;
    ormEntity.fullName = user.fullName;
    ormEntity.isActive = user.isActive;
    ormEntity.createdAt = user.createdAt;

    return ormEntity;
  }
}

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\persistence\user.persistence.mapper.ts"

@'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';
import { UserPersistenceMapper } from './user.persistence.mapper';

/**
 * Implementación concreta del puerto `UserRepository` con TypeORM. Vive
 * en `infrastructure` y se inyecta en `application` a través del token
 * `USER_REPOSITORY` (ver `users.module.ts`) — el use case nunca importa
 * esta clase ni `typeorm` directamente.
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? UserPersistenceMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { email: email.value } });
    return ormEntity ? UserPersistenceMapper.toDomain(ormEntity) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.ormRepository.count({ where: { email: email.value } });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const ormEntity = UserPersistenceMapper.toPersistence(user);
    await this.ormRepository.save(ormEntity);
  }
}

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\persistence\typeorm-user.repository.ts"

@'
import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { UserOrmEntity } from './user.orm-entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { User } from '../../domain/entities/user.entity';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let ormRepository: jest.Mocked<Pick<Repository<UserOrmEntity>, 'findOne' | 'count' | 'save'>>;

  const validHash = '$2b$12$' + 'a'.repeat(53); // 60 chars totales

  const ormEntityFixture: UserOrmEntity = Object.assign(new UserOrmEntity(), {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: validHash,
    fullName: 'Nombre Apellido',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    ormRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
    };

    // El constructor recibe el Repository<UserOrmEntity> vía @InjectRepository;
    // acá se lo pasamos directo como mock, sin levantar ninguna conexión real.
    repository = new TypeOrmUserRepository(ormRepository as unknown as Repository<UserOrmEntity>);
  });

  describe('findById', () => {
    it('devuelve un User de dominio cuando el ORM entity existe', async () => {
      ormRepository.findOne.mockResolvedValue(ormEntityFixture);

      const user = await repository.findById(ormEntityFixture.id);

      expect(user).toBeInstanceOf(User);
      expect(user?.email.value).toBe('user@example.com');
      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: ormEntityFixture.id } });
    });

    it('devuelve null cuando no existe', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const user = await repository.findById('no-existe');

      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('busca por el valor normalizado del Email value object', async () => {
      ormRepository.findOne.mockResolvedValue(ormEntityFixture);
      const email = Email.create('User@Example.com');

      const user = await repository.findByEmail(email);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(user).toBeInstanceOf(User);
    });
  });

  describe('existsByEmail', () => {
    it('devuelve true cuando count > 0', async () => {
      ormRepository.count.mockResolvedValue(1);

      await expect(repository.existsByEmail(Email.create('user@example.com'))).resolves.toBe(true);
    });

    it('devuelve false cuando count es 0', async () => {
      ormRepository.count.mockResolvedValue(0);

      await expect(repository.existsByEmail(Email.create('nadie@example.com'))).resolves.toBe(
        false,
      );
    });
  });

  describe('save', () => {
    it('mapea el User de dominio a UserOrmEntity antes de persistir', async () => {
      const user = User.register({
        email: Email.create('nuevo@example.com'),
        password: Password.fromHash(validHash),
        fullName: 'Nuevo Usuario',
      });

      await repository.save(user);

      expect(ormRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id.toString(),
          email: 'nuevo@example.com',
          passwordHash: validHash,
          fullName: 'Nuevo Usuario',
          isActive: true,
        }),
      );
    });
  });
});

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\persistence\typeorm-user.repository.spec.ts"

@'
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/password-hasher.interface';

/**
 * Implementación concreta del puerto `PasswordHasher` con bcrypt. Vive en
 * `infrastructure` y se inyecta vía el token `PASSWORD_HASHER` — el use
 * case nunca importa `bcrypt` directamente (ver `password-hasher.interface.ts`).
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  // 12 rounds: balance entre costo de cómputo y resistencia a fuerza
  // bruta razonable para 2026 en hardware de servidor estándar.
  private static readonly SALT_ROUNDS = 12;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BcryptPasswordHasher.SALT_ROUNDS);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\services\bcrypt-password-hasher.ts"

@'
import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  it('produce un hash con el formato de bcrypt ($2b$..., 60 caracteres)', async () => {
    const hash = await hasher.hash('un-password-cualquiera');

    expect(hash).toHaveLength(60);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('genera hashes distintos para el mismo password (salt aleatorio)', async () => {
    const hashA = await hasher.hash('mismo-password');
    const hashB = await hasher.hash('mismo-password');

    expect(hashA).not.toEqual(hashB);
  });

  it('compare() devuelve true cuando el password en texto plano coincide con el hash', async () => {
    const hash = await hasher.hash('correcto123');

    await expect(hasher.compare('correcto123', hash)).resolves.toBe(true);
  });

  it('compare() devuelve false cuando el password en texto plano no coincide', async () => {
    const hash = await hasher.hash('correcto123');

    await expect(hasher.compare('incorrecto456', hash)).resolves.toBe(false);
  });
});

'@ | Out-File -Encoding utf8 "src\modules\users\infrastructure\services\bcrypt-password-hasher.spec.ts"

@'
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO de HTTP (`class-validator` + Swagger). Distinto del
 * `RegisterUserRequest` de `application` — este es el contrato que
 * expone la API, el otro es el contrato interno del use case.
 *
 * `@IsEmail()` acá es la validación de formato en la que confía
 * `RegisterUserUseCase` (ver el comentario en `register-user.use-case.ts`):
 * si un email mal formado llega hasta `Email.create()`, algo se saltó
 * esta capa.
 */
export class RegisterUserHttpRequestDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'unPasswordSeguro123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'El password debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'El password no puede superar los 72 caracteres (límite de bcrypt)' })
  password!: string;

  @ApiProperty({ example: 'Nombre Apellido' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;
}

'@ | Out-File -Encoding utf8 "src\modules\users\presentation\dtos\register-user-http.request.dto.ts"

@'
import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserResponse } from '../../application/use-cases/register-user/register-user.response';

/**
 * DTO de HTTP para la respuesta. Se construye a partir del
 * `RegisterUserResponse` de application — nunca al revés, para que
 * application no dependa de Swagger ni de presentation.
 */
export class RegisterUserHttpResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  createdAt!: Date;

  private constructor(props: RegisterUserHttpResponseDto) {
    Object.assign(this, props);
  }

  static fromApplicationResponse(response: RegisterUserResponse): RegisterUserHttpResponseDto {
    return new RegisterUserHttpResponseDto({
      id: response.id,
      email: response.email,
      fullName: response.fullName,
      createdAt: response.createdAt,
    });
  }
}

'@ | Out-File -Encoding utf8 "src\modules\users\presentation\dtos\register-user-http.response.dto.ts"

@'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { RegisterUserHttpRequestDto } from '../dtos/register-user-http.request.dto';
import { RegisterUserHttpResponseDto } from '../dtos/register-user-http.response.dto';

/**
 * Adaptador delgado entre HTTP y `application`: recibe el DTO ya
 * validado por `class-validator`, arma el `RegisterUserRequest` interno,
 * llama al use case y traduce el `Result` a una respuesta HTTP.
 *
 * `if (result.isFailure) throw result.error` — el error sigue siendo la
 * `DomainException` real (`UserAlreadyExistsException`); el
 * `HttpExceptionFilter` global ya sabe mapearla a 409. El controller no
 * decide el código de estado del error, solo delega.
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: RegisterUserHttpResponseDto })
  @ApiConflictResponse({ description: 'Ya existe un usuario registrado con ese email' })
  async register(@Body() dto: RegisterUserHttpRequestDto): Promise<RegisterUserHttpResponseDto> {
    const result = await this.registerUserUseCase.execute({
      email: dto.email,
      plainPassword: dto.password,
      fullName: dto.fullName,
    });

    if (result.isFailure) {
      throw result.error;
    }

    return RegisterUserHttpResponseDto.fromApplicationResponse(result.value);
  }
}

'@ | Out-File -Encoding utf8 "src\modules\users\presentation\controllers\users.controller.ts"

@'
import { Test, TestingModule } from '@nestjs/testing';
import { Result } from '@shared/application';
import { UsersController } from './users.controller';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { RegisterUserHttpRequestDto } from '../dtos/register-user-http.request.dto';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterUserResponse } from '../../application/use-cases/register-user/register-user.response';

describe('UsersController', () => {
  let controller: UsersController;
  let useCase: jest.Mocked<Pick<RegisterUserUseCase, 'execute'>>;

  const dto: RegisterUserHttpRequestDto = {
    email: 'nuevo@example.com',
    password: 'unPasswordSeguro123',
    fullName: 'Nombre Apellido',
  };

  beforeEach(async () => {
    useCase = { execute: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: RegisterUserUseCase, useValue: useCase }],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('devuelve el DTO de respuesta cuando el Result es exitoso', async () => {
    const applicationResponse: RegisterUserResponse = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'nuevo@example.com',
      fullName: 'Nombre Apellido',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    useCase.execute.mockResolvedValue(Result.ok(applicationResponse));

    const response = await controller.register(dto);

    expect(response).toEqual(
      expect.objectContaining({
        id: applicationResponse.id,
        email: applicationResponse.email,
        fullName: applicationResponse.fullName,
      }),
    );
    expect(useCase.execute).toHaveBeenCalledWith({
      email: dto.email,
      plainPassword: dto.password,
      fullName: dto.fullName,
    });
  });

  it('lanza la DomainException real cuando el Result falla (para que el HttpExceptionFilter la mapee)', async () => {
    const error = new UserAlreadyExistsException(dto.email);
    useCase.execute.mockResolvedValue(Result.fail(error));

    await expect(controller.register(dto)).rejects.toThrow(UserAlreadyExistsException);
    await expect(controller.register(dto)).rejects.toBe(error);
  });
});

'@ | Out-File -Encoding utf8 "src\modules\users\presentation\controllers\users.controller.spec.ts"

@'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { UsersController } from './presentation/controllers/users.controller';

/**
 * Conecta las cuatro capas del módulo. Los puertos (`USER_REPOSITORY`,
 * `PASSWORD_HASHER`) definidos en `domain` se ligan acá a sus
 * implementaciones concretas de `infrastructure` — este es el único
 * lugar del módulo que conoce ambos lados a la vez.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    RegisterUserUseCase,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
})
export class UsersModule {}

'@ | Out-File -Encoding utf8 "src\modules\users\users.module.ts"

@'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { envValidationSchema } from './config/env.validation';
import { LoggerModule } from './shared/logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    LoggerModule,
    HealthModule,
    DatabaseModule,
    UsersModule,
    // A partir de la Fase 4: AuthModule.
    // A partir de la Fase 5: RolesModule, PermissionsModule.
  ],
})
export class AppModule {}

'@ | Out-File -Encoding utf8 "src\app.module.ts"

@'
process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

import { Global, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { DatabaseModule } from './infrastructure/database/database.module';

/**
 * Este test solo verifica que el GRAFO de módulos compile (que todas las
 * dependencias se puedan resolver) — no que la conexión real a Postgres
 * funcione, eso es responsabilidad de un test e2e con base de datos real
 * (docker-compose). Por eso se sobreescribe `DatabaseModule`: sin esto,
 * `TypeOrmModule.forRootAsync` intenta abrir una conexión real durante
 * `compile()` y el test queda colgado hasta hacer timeout.
 *
 * `FakeDatabaseModule` provee un `DataSource` falso bajo el mismo token
 * que usa `@nestjs/typeorm` (`getDataSourceToken()`), con un
 * `getRepository()` que devuelve un objeto vacío — suficiente para que
 * `TypeOrmModule.forFeature([UserOrmEntity])` (dentro de `UsersModule`)
 * pueda instanciar sus providers sin fallar.
 */
const fakeDataSource = {
  getRepository: () => ({}),
  entityMetadatas: [],
  isInitialized: true,
  options: {},
};

@Global()
@Module({
  providers: [{ provide: getDataSourceToken(), useValue: fakeDataSource }],
  exports: [getDataSourceToken()],
})
class FakeDatabaseModule {}

process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)
      .compile();
  });

  it('should compile the module graph', () => {
    expect(moduleRef).toBeDefined();
  });
});

'@ | Out-File -Encoding utf8 "src\app.module.spec.ts"
