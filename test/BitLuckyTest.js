const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BitLucky", function () {
	let BitLucky;
	let bitLucky;
	let owner;
	let user1;
	let user2;
	let usdtToken;

	beforeEach(async function () {
		[owner, user1, user2] = await ethers.getSigners();

		const bitluckyRandomnessContractAddress =
			"0xc3109f02af9FCe3576f09639324E46Ed7caBb90E";

		// Deploy the BitLucky contract
		BitLucky = await ethers.getContractFactory("BitLucky");
		bitLucky = await BitLucky.deploy(bitluckyRandomnessContractAddress);
		await bitLucky.deployed();

		// Deploy a mock USDT token (you may need to replace this with the actual USDT token address)
		const UsdtToken = await ethers.getContractFactory("testUSDT");
		usdtToken = await UsdtToken.deploy();
		await usdtToken.deployed();

		// Mint some USDT tokens for testing
		const initialBalance = ethers.utils.parseEther("1000");
		await usdtToken.mint(owner.address, initialBalance);
		await usdtToken.mint(user1.address, initialBalance);
		await usdtToken.mint(user2.address, initialBalance);
	});

	it("should create a product", async function () {
		const productName = "Test Product";
		const ticketPrice = 100;
		const maxTickets = 100;
		const closedTimeMinutes = 10;
		const nftURI = "https://example.com/nft";

		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTimeMinutes,
				productName,
				nftURI
			);

		const productCount = await bitLucky.productCount();
		const product = await bitLucky.products(productCount - 1); // Fetch the product details

		const currentTime = Math.floor(Date.now() / 1000);
		const closedTime = currentTime + closedTimeMinutes * 60;

		expect(product.ticketPrice).to.equal(ticketPrice);
		expect(product.maxTickets).to.equal(maxTickets);
		expect(product.ticketsSold).to.equal(0);
		expect(product.productName).to.equal("Test Product");
		expect(product.isAllSold).to.equal(false);
		expect(product.productWinner).to.equal(
			"0x0000000000000000000000000000000000000000"
		);
		expect(product.closedTime).to.be.closeTo(closedTime, 5);
		expect(product.productName).to.equal(productName);

		const retrievedNftURI = await bitLucky.nftURIs(productCount - 1);
		const tokenBalance = await bitLucky.balanceOf(
			owner.address,
			productCount - 1
		);

		expect(productCount).to.equal(1);
		expect(retrievedNftURI).to.equal(nftURI);
		expect(tokenBalance).to.equal(1);
	});

	// it("should allow a user to buy tickets", async function () {
	// 	// Create a product
	// 	const ticketPrice = 100;
	// 	const maxTickets = 10;
	// 	const closedTime = Math.floor(Date.now() / 1000) + 3600;
	// 	const productName = "Test Product";
	// 	const nftURI = "https://example.com/nft";
	// 	await bitLucky
	// 		.connect(owner)
	// 		.createProduct(ticketPrice, maxTickets, closedTime, productName, nftURI);

	// 	// Approve USDT spending for the user
	// 	const totalCost = ticketPrice * 3;
	// 	await usdtToken.connect(user1).approve(bitLucky.address, totalCost);

	// 	// Buy tickets for the user
	// 	await bitLucky.connect(user1).buyTickets(0, 3);

	// 	// Check that the user's balance of NFTs has increased
	// 	const userNFTBalance = await bitLucky.balanceOf(user1.address, 0);
	// 	expect(userNFTBalance.toNumber()).to.equal(3);
	// });

	// it("should select a winner", async function () {
	// 	// Create a product
	// 	const ticketPrice = 100;
	// 	const maxTickets = 10;
	// 	const closedTime = Math.floor(Date.now() / 1000) - 3600; // Set the closing time 1 hour ago
	// 	const productName = "Test Product";
	// 	const nftURI = "https://example.com/nft";
	// 	await bitLucky
	// 		.connect(owner)
	// 		.createProduct(ticketPrice, maxTickets, closedTime, productName, nftURI);

	// 	// Buy all available tickets
	// 	const totalCost = ticketPrice * maxTickets;
	// 	await usdtToken.connect(user1).approve(bitLucky.address, totalCost);
	// 	await bitLucky.connect(user1).buyTickets(0, maxTickets);

	// 	// Select a winner
	// 	await bitLucky.connect(owner).selectWinner(0);

	// 	// Check that a winner has been selected
	// 	const winner = await bitLucky.productWinners(0);
	// 	expect(winner).to.equal(user1.address);
	// });

	// it("should update the closing time", async function () {
	// 	// Create a product
	// 	const ticketPrice = 100;
	// 	const maxTickets = 10;
	// 	const initialClosedTime = Math.floor(Date.now() / 1000) + 3600;
	// 	const productName = "Test Product";
	// 	const nftURI = "https://example.com/nft";
	// 	await bitLucky
	// 		.connect(owner)
	// 		.createProduct(
	// 			ticketPrice,
	// 			maxTickets,
	// 			initialClosedTime,
	// 			productName,
	// 			nftURI
	// 		);

	// 	// Update the closing time
	// 	const additionalTime = 1800; // 30 minutes
	// 	await bitLucky.connect(owner).updateClosedTime(0, additionalTime);

	// 	// Check that the closing time has been updated
	// 	const updatedProduct = await bitLucky.products(0);
	// 	expect(updatedProduct.closedTime.toNumber()).to.equal(
	// 		initialClosedTime + additionalTime
	// 	);
	// });

	// it("should allow a user to claim a refund", async function () {
	// 	// Create a product
	// 	const ticketPrice = 100;
	// 	const maxTickets = 10;
	// 	const closedTime = Math.floor(Date.now() / 1000) - 3600; // Set the closing time 1 hour ago
	// 	const productName = "Test Product";
	// 	const nftURI = "https://example.com/nft";
	// 	await bitLucky
	// 		.connect(owner)
	// 		.createProduct(ticketPrice, maxTickets, closedTime, productName, nftURI);

	// 	// Buy some tickets
	// 	const totalCost = ticketPrice * 5;
	// 	await usdtToken.connect(user1).approve(bitLucky.address, totalCost);
	// 	await bitLucky.connect(user1).buyTickets(0, 5);

	// 	// Claim a refund
	// 	await bitLucky.connect(user1).refund(0);

	// 	// Check that the user's balance of USDT has increased
	// 	const userUSDTBalance = await usdtToken.balanceOf(user1.address);
	// 	const expectedBalance = totalCost - ticketPrice * 5; // Refund for unsold tickets
	// 	expect(userUSDTBalance.toNumber()).to.equal(expectedBalance);
	// });
});
