<script setup lang="ts">
import type { ColumnFiltersState } from '@tanstack/vue-table'
import type { ColsDef, Data } from './columns'
import { FlexRender, getCoreRowModel, getFilteredRowModel, useVueTable } from '@tanstack/vue-table'
import { ref } from 'vue'

const props = defineProps<{
  columns: ColsDef
  data: Data
  searchInput: string
}>()

const columnFilters = ref<ColumnFiltersState>([])

const table = useVueTable({
  get data() { return props.data || [] },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),

  getFilteredRowModel: getFilteredRowModel(),
  state: {
    // column filters getter
    get columnFilters() { return columnFilters.value },
    get globalFilter() { return props.searchInput },
  },
  // column filters setter
  onColumnFiltersChange: useValueUpdaterFn(columnFilters),
})
</script>

<template>
  <TableWrapper>
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template
          v-if="table.getRowModel().rows?.length"
        >
          <TableRow
            v-for="row in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :columnspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </TableWrapper>
</template>
