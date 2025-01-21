import { SubMenu } from './submenu';

export class Menu {
  public id!: number;
  public name!: string;
  public price!: number;
  public subMenuList!: Array<SubMenu>;
}
