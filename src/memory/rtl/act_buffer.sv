
module act_buffer #(
    parameter int N = 8,
    parameter int DATA_WIDTH = 8,
    parameter int ADDR_WIDTH = 8,
    parameter int READ_LATENCY = 1,
    parameter int NBUF = 3,
    parameter int SEL_WIDTH = $clog2(NBUF)
)(
    input  logic                        clk,

    // Read port
    input  logic                        rd_en,
    input  logic [ADDR_WIDTH-1:0]       rd_addr,
    input  logic [SEL_WIDTH-1:0]        rd_sel,
    output logic [N*DATA_WIDTH-1:0]     rd_data,

    // Write port
    input  logic                        we,
    input  logic [ADDR_WIDTH-1:0]       waddr,
    input  logic [N*DATA_WIDTH-1:0]     wdata,
    input  logic [SEL_WIDTH-1:0]        wr_sel,

    // Host write port
    input  logic                        host_mode,
    input  logic                        host_we,
    input  logic [ADDR_WIDTH-1:0]       host_waddr,
    input  logic [N*DATA_WIDTH-1:0]     host_wdata,
    input  logic [SEL_WIDTH-1:0]        host_wr_sel
);

    localparam int WORD_WIDTH = N * DATA_WIDTH;

    logic [WORD_WIDTH-1:0] bank_rdata [0:NBUF-1];

    logic [SEL_WIDTH-1:0] sel_pipe [0:READ_LATENCY-1];

    logic                 write_en;
    logic [ADDR_WIDTH-1:0] write_addr;
    logic [WORD_WIDTH-1:0] write_data;
    logic [SEL_WIDTH-1:0]  write_sel;
    logic                 read_advance;

    // Host has exclusive write access between layers
    assign write_en   = host_mode ? host_we      : we;
    assign write_addr = host_mode ? host_waddr   : waddr;
    assign write_data = host_mode ? host_wdata   : wdata;
    assign write_sel  = host_mode ? host_wr_sel  : wr_sel;

    assign read_advance = rd_en && !host_mode;

    // Instantiate three BRAM buffers
    genvar i;
    generate
        for (i = 0; i < NBUF; i = i + 1) begin : GEN_BRAM

            bram #(
                .DATA_WIDTH(WORD_WIDTH),
                .ADDR_WIDTH(ADDR_WIDTH),
                .READ_LATENCY(READ_LATENCY)
            ) u_bram (
                .clk(clk),
                .we(write_en && (write_sel == i)),
                .waddr(write_addr),
                .wdata(write_data),
                .re(read_advance),
                .raddr(rd_addr),
                .rdata(bank_rdata[i])
            );

        end
    endgenerate

    // Track which buffer each read belongs to
    // Pipeline stalls whenever read_advance is low
    integer j;
    always_ff @(posedge clk) begin
        if (read_advance) begin
            sel_pipe[0] <= rd_sel;

            for (j = 1; j < READ_LATENCY; j = j + 1)
                sel_pipe[j] <= sel_pipe[j-1];
        end
    end

    // Select the correct BRAM output
    assign rd_data = bank_rdata[sel_pipe[READ_LATENCY-1]];

endmodule
