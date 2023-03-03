const customERC20 = artifacts.require("customERC20");

contract("customERC20", accounts => {
    console.log("Accounts: ", accounts);

    it('function ERC20 name() is ok', async () => {
        let instance = await customERC20.deployed();
        const _name = await instance.name.call();
        assert.equal(_name, "MartinezCoin");
    })

    it('function ERC20 symbol() is ok', async () => {
        let instance = await customERC20.deployed();
        const _symbol = await instance.symbol.call();
        assert.equal(_symbol, "MZC");
    })

    it('function ERC20 decimals() is ok', async () => {
        let instance = await customERC20.deployed();
        const _decimals = await instance.decimals.call();
        assert.equal(_decimals, 18);
    })

    it('supply of tokens is ok', async () => {
        let instance = await customERC20.deployed();
        const _initial_supply = await instance.totalSupply.call();
        assert.equal(_initial_supply, 0);

        await instance.createTokens();

        const _supply = await instance.totalSupply.call();
        assert.equal(_supply, 1000);
    })

    it('function ERC20 transfer() is ok', async () => {
        let instance = await customERC20.deployed();

        // tranfer 10 tokens from account 0 to accoun 1
        await instance.transfer(accounts[1], 10, {from: accounts[0]});

        let _balance0 = await instance.balanceOf.call(accounts[0])
        assert.equal(_balance0, 1000 - 10);

        let _balance1 = await instance.balanceOf.call(accounts[1])
        assert.equal(_balance1, 10);
    })

    it('function ERC20 approve(), allowance() & transferFrom() is ok', async () => {
        let instance = await customERC20.deployed();

        // check the initial allowance
        let _initial_allowance = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(_initial_allowance, 0);

        // approve the allowance of 100 tokens from 0 to 1
        await instance.approve(accounts[1], 100, {from: accounts[0]});
        let _current_allowance = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(_current_allowance, 100);

        // balance of 1 is still "zero", 1 is only allowed to tranfer 100 tokens of 0
        let _balance1 = await instance.balanceOf.call(accounts[1])
        assert.equal(_balance1, 10); // 10 tokens from previous test transfer

        // transfer 100 tokens to 2 from 0 but the transfer is realized by 1
        await instance.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]})

        let _allowance_after_transfer = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(_allowance_after_transfer, 0);

        // balance of 2 is 100
        let _balance2 = await instance.balanceOf.call(accounts[2])
        assert.equal(_balance2, 100);
    })

    it('function ERC20 increaseAllowance() & decreaseAllowance() is ok', async () => {
        let instance = await customERC20.deployed();

        addr = accounts[4];

        await instance.approve(addr, 100, {from: accounts[0]});
        let _initial_allowance = await instance.allowance(accounts[0], addr);
        assert.equal(_initial_allowance, 100);

        await instance.increaseAllowance(addr, 200);
        let _current_allowance = await instance.allowance(accounts[0], addr);
        assert.equal(_current_allowance, 100 + 200);

        await instance.decreaseAllowance(addr, 50);
        let _final_allowance = await instance.allowance(accounts[0], addr);
        assert.equal(_final_allowance, 100 + 200 - 50);
    })

    it('function ERC20 burn()', async () => {
        let instance = await customERC20.deployed();

        let _total_balance = await instance.balanceOf(accounts[0]);
        await instance.deleteTokens(accounts[0], _total_balance);

        let _final_total_balance = await instance.balanceOf(accounts[0]);
        assert.equal(_final_total_balance, 0);
    })
})