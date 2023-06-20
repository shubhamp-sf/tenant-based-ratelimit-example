// Copyright (c) 2022 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {model, property} from '@loopback/repository';
import {UserModifiableEntity} from '@sourceloop/core';

@model({
  name: 'todos',
})
export class ToDo extends UserModifiableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'array',
    itemType: 'string',
    postgresql: {
      dataType: 'varchar[]',
    },
  })
  items?: string[];

  @property({
    type: 'string',
    name: 'tenant_id',
  })
  tenantId: string;

  constructor(data?: Partial<ToDo>) {
    super(data);
  }
}

export type ToDoWithRelations = ToDo;
