import React from "react";
import {
  cleanup,
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react";
import axios from "axios";
import UploadEvidence from "../UploadEvidence";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";

jest.mock("axios");

describe("UploadEvidence component", () => {
  const mockSetUploadFiles = jest.fn();
  const mockSetDeleteFiles = jest.fn();
  const mockFiles = [
    { name: "file1.xlsx", size: 1024 },
    { name: "file2.xlsx", size: 2048 },
  ];
  const mockDetails = {
    attachments: [
      {
        id: 1,
        filename: "attachment1.pdf",
        size: 512,
        url: "http://example.com/attachment1.pdf",
      },
    ],
  };

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /// Setup the component with the given mockFiles
  /// @param {Array} mockFiles - The mock files to be used in the test
  /// @returns {void}
  const setup = (mockFiles = []) => {
    render(
      <UploadEvidence
        details={{ attachments: [] }}
        setUploadFiles={mockSetUploadFiles}
        files={mockFiles}
        setDeleteFiles={mockSetDeleteFiles}
        deleteFiles={[]}
      />,
    );
  };

  /// Set up the component with a container to access query selectors
  /// @param {Object} details - The details object to be used in the test
  /// @param {Array} files - The files array to be used in the test
  /// @returns {Object} The container object
  const setUpContainer = (details = { attachments: [] }, files = []) => {
    const { container } = render(
      <UploadEvidence
        details={details}
        setUploadFiles={mockSetUploadFiles}
        files={files}
        setDeleteFiles={mockSetDeleteFiles}
        deleteFiles={[]}
      />,
    );
    return container;
  };

  it("renders the component without files/attachments", () => {
    setup();
    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(screen.queryByText("Filename")).not.toBeInTheDocument();
  });

  it("calls setUploadFiles when a file is uploaded", async () => {
    const container = setUpContainer();
    const excelFile = new File(["dummy content"], "example.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileDrop = container.querySelector("input[type=file]");
    await userEvent.upload(fileDrop, excelFile);
    await waitFor(() =>
      expect(mockSetUploadFiles).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "example.xlsx" }),
        ]),
      ),
    );
  });

  it("renders files and attachments correctly", () => {
    setup(mockFiles);
    expect(screen.getByText("file1.xlsx")).toBeInTheDocument();
    expect(screen.getByText("file2.xlsx")).toBeInTheDocument();
  });

  it("handles file removal correctly", () => {
    const container = setUpContainer(undefined, mockFiles);
    const deleteButtons = container.querySelectorAll("button.delete");
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    // Check if the file was removed, state is updated after the click event
    expect(mockSetUploadFiles).toHaveBeenCalledWith([
      { name: "file2.xlsx", size: 2048 },
    ]);
  });

  it("marks attachment for deletion", async () => {
    const container = setUpContainer(mockDetails, mockFiles);
    const deleteButtons = container.querySelectorAll("button.delete");
    expect(deleteButtons.length).toBe(3);

    const deleteButton = deleteButtons[0];

    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockSetDeleteFiles).toHaveBeenCalledWith([1]));
  });
});
