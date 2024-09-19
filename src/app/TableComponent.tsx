import { Table, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";

interface TableProps {
  headers: string[];
  rows: Record<string, string>[];
  selectedRowIndex: number;
}

export const TableComponent = ({
  headers,
  rows,
  selectedRowIndex,
}: TableProps) => (
  <Table minW="100%">
    <Thead bg="#b7c5d2">
      <Tr>
        {headers.map((header) => (
          <Th py={8} px={16} key={header} color="#293846">
            {header}
          </Th>
        ))}
      </Tr>
    </Thead>

    <Tbody>
      {rows.map((row, index) => (
        <Tr key={index} bg={index === selectedRowIndex ? "#ebf0f5" : "#fff"}>
          {headers.map((header) => (
            <Td key={`${index}-${header}`} py={8} px={16} color="#465664">
              {row[header]}
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  </Table>
);
