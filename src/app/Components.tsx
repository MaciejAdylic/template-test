// src/styles/StyledComponents.ts
import styled from "styled-components";

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 100vw;
  background: white;
`;

export const PreviewContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100vw;
  overflow: auto;
`;

export const PreviewFrame = styled.iframe`
  width: 300px;
  height: 250px;
  border: none;
`;

export const TableContainer = styled.div`
  min-width: 100vw;
  overflow: auto;
`;
