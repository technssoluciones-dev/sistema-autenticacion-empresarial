import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  EntityNotFoundException,
  BusinessRuleViolationException,
  InvalidValueObjectException,
  DomainException,
} from '@shared/domain';
import { HttpExceptionFilter } from './http-exception.filter';

// DomainException no contemplada explícitamente en el mapeo, para probar
// el fallback a 422 sin depender de ninguna excepción concreta futura.
class UnmappedDomainException extends DomainException {
  constructor() {
    super('excepción de dominio no mapeada explícitamente');
  }
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockRequest = { url: '/api/users', method: 'POST' } as Request;

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as unknown as Response,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('mapea EntityNotFoundException a 404', () => {
    filter.catch(new EntityNotFoundException('User', 'abc-123'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'EntityNotFoundException',
      }),
    );
  });

  it('mapea BusinessRuleViolationException a 409', () => {
    filter.catch(new BusinessRuleViolationException('email ya registrado'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('mapea InvalidValueObjectException a 400', () => {
    filter.catch(new InvalidValueObjectException('email con formato inválido'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('mapea una DomainException no contemplada explícitamente a 422', () => {
    filter.catch(new UnmappedDomainException(), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('preserva el comportamiento existente para HttpException', () => {
    filter.catch(new HttpException('no autorizado', HttpStatus.UNAUTHORIZED), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('excepciones desconocidas (no Http ni Domain) devuelven 500 genérico sin filtrar detalles', () => {
    filter.catch(new Error('algo interno se rompió con detalles sensibles'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
        error: 'InternalServerError',
      }),
    );
  });

  it('incluye el mensaje real de la DomainException en la respuesta (no es información sensible)', () => {
    filter.catch(new EntityNotFoundException('User', 'abc-123'), mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('abc-123'),
      }),
    );
  });
});
