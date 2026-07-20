import { UniqueEntityId } from './unique-entity-id';

/**
 * Una Entidad se distingue por su IDENTIDAD, no por sus atributos.
 * Dos usuarios con el mismo nombre son entidades distintas si tienen
 * distinto `id`; dos usuarios con el mismo `id` son la misma entidad
 * aunque uno tenga el email actualizado.
 *
 * Las entidades concretas del negocio (User, Role, Permission, ...)
 * extienden esta clase. No dependen de NestJS, de un ORM ni de HTTP:
 * son TypeScript puro, testeable sin infraestructura.
 */
export abstract class Entity<Props> {
  protected readonly _id: UniqueEntityId;
  protected readonly props: Props;

  protected constructor(props: Props, id?: UniqueEntityId) {
    this._id = id ?? UniqueEntityId.create();
    this.props = props;
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  equals(other?: Entity<Props>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._id.equals(other._id);
  }
}
