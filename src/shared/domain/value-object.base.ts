/**
 * Un Value Object se distingue por sus ATRIBUTOS, no por identidad.
 * Dos instancias de `Email("a@a.com")` son iguales entre sí, sin importar
 * si vienen de objetos distintos en memoria.
 *
 * Se usan para modelar conceptos del negocio con sus propias reglas de
 * validación (Email, Password, PhoneNumber, ...), en vez de pasar `string`
 * sueltos que cualquier función puede mutar o mal-formar.
 *
 * Ejemplo de uso (Fase 3): `class Email extends ValueObject<{ value: string }>`
 * con su propia validación de formato en el constructor privado.
 */
export abstract class ValueObject<Props> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = Object.freeze(props);
  }

  equals(other?: ValueObject<Props>): boolean {
    if (other === null || other === undefined) return false;
    if (other.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
