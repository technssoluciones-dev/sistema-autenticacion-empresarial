/**
 * Todo caso de uso implementa este contrato. Un caso de uso representa
 * UNA acción de negocio (`RegisterUserUseCase`, `LoginUseCase`,
 * `AssignRoleUseCase`...) y orquesta entidades de dominio + repositorios.
 *
 * Los controllers (presentation) SOLO llaman `.execute()`. No conocen
 * repositorios, no arman entidades, no tienen lógica de negocio: son un
 * adaptador delgado entre HTTP y la capa de aplicación.
 */
export interface UseCase<Request, Response> {
  execute(request: Request): Promise<Response> | Response;
}
