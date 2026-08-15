import { Button, Col, Dropdown, Form, InputGroup, Row } from 'react-bootstrap'

export type Sort = '' | 'price-asc' | 'price-desc' | 'new-arrival' | 'top-rating'

export interface Filters {
  category: string
  sizes: string[]
  colors: string[]
  minPrice: string
  maxPrice: string
  ratings: string[]
  sort: Sort
}

export const defaultFilters: Filters = {
  category: '',
  sizes: [],
  colors: [],
  minPrice: '',
  maxPrice: '',
  ratings: [],
  sort: '',
}

interface ProductFiltersProps {
  query: string
  filters: Filters
  categories: string[]
  sizeOptions: string[]
  colorOptions: string[]
  onQueryChange: (query: string) => void
  onFiltersChange: (filters: Filters) => void
  onSearch: () => void
  onClear: () => void
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  }

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start">
        {selected.length ? `${label}: ${selected.length}` : label}
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100 p-2 filter-menu">
        {options.length ? options.map((option) => (
          <Form.Check
            key={option.value}
            id={`filter-${label}-${option.value}`.replace(/\W+/g, '-').toLowerCase()}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
        )) : <small className="text-secondary">No options</small>}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export function ProductFilters({
  query,
  filters,
  categories,
  sizeOptions,
  colorOptions,
  onQueryChange,
  onFiltersChange,
  onSearch,
  onClear,
}: ProductFiltersProps) {
  const update = (change: Partial<Filters>) => onFiltersChange({ ...filters, ...change })

  return (
    <Form onSubmit={(event) => { event.preventDefault(); onSearch() }}>
      <Row className="g-2 mb-3">
        <Col xs={5}>
          <InputGroup>
            <Form.Control
              type="search"
              value={query}
              placeholder="Search products"
              aria-label="Search products"
              onChange={(event) => onQueryChange(event.target.value)}
            />
            <Button type="submit" variant="dark">Search</Button>
          </InputGroup>
        </Col>
        <Col xs={3}>
          <Form.Select
            aria-label="Product category"
            value={filters.category}
            onChange={(event) => update({ category: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={3}>
          <Form.Select
            aria-label="Sort products"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value as Sort })}
          >
            <option value="">Sort</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="new-arrival">New arrivals</option>
            <option value="top-rating">Top rated</option>
          </Form.Select>
        </Col>
        <Col xs={1}>
          <Button variant="outline-secondary" className="w-100" onClick={onClear}>Clear</Button>
        </Col>
      </Row>

      <Row className="g-2 mb-3">
        <Col xs={3}>
          <MultiSelect
            label="Size"
            options={sizeOptions.map((value) => ({ value, label: value }))}
            selected={filters.sizes}
            onChange={(sizes) => update({ sizes })}
          />
        </Col>
        <Col xs={3}>
          <MultiSelect
            label="Color"
            options={colorOptions.map((value) => ({ value, label: value }))}
            selected={filters.colors}
            onChange={(colors) => update({ colors })}
          />
        </Col>
        <Col xs={3}>
          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              placeholder="Min price"
              aria-label="Minimum price"
              value={filters.minPrice}
              onChange={(event) => update({ minPrice: event.target.value })}
            />
            <Form.Control
              type="number"
              min="0"
              placeholder="Max price"
              aria-label="Maximum price"
              value={filters.maxPrice}
              onChange={(event) => update({ maxPrice: event.target.value })}
            />
          </InputGroup>
        </Col>
        <Col xs={3}>
          <MultiSelect
            label="Rating"
            options={[5, 4, 3, 2, 1].map((rating) => ({
              value: String(rating),
              label: `${rating} star${rating === 1 ? '' : 's'}`,
            }))}
            selected={filters.ratings}
            onChange={(ratings) => update({ ratings })}
          />
        </Col>
      </Row>
    </Form>
  )
}
