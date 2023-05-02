import { expect } from 'chai';
const { ethers, waffle, upgrades } = require("hardhat");
import { AmoCoin } from '../typechain';

let amoCoin: AmoCoin;

var deployedContract = '0x4A679253410272dd5232B3Ff7cF5dbB88f295319';

describe('인스턴스 생성', function () {
  before(async function () {
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });
  it('토큰 정보 체크', async function () {
    const signer = await ethers.getSigners();
    const address01 = signer[0].address;

    const name = await amoCoin.name();
    const symbol = await amoCoin.symbol();
    const decimals = await amoCoin.decimals();
    const adminAddress = await amoCoin.adminAddress();
    const totalSupply = await amoCoin.totalSupply(); 
    const adminBalance = await amoCoin.balanceOf(adminAddress);

//    expect(name).to.equal('AMO Coin');
//    expect(symbol).to.equal('AMO');
    expect(name).to.equal('AMO Coin');
    expect(symbol).to.equal('AMO');
    expect(decimals).to.equal(18);
    expect(totalSupply).to.equal('23000000000000000000000000000');
    expect(adminAddress).to.equal(address01);
    expect(totalSupply).to.equal(adminBalance);
  });
});

describe('어드민 변경', function () {
  before(async function () {
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });
  it('어드민 변경', async function () {
    const signer = await ethers.getSigners();
    const account01 = signer[0].address;
    const account02 = signer[1].address;    
    const signer1 = await ethers.getSigner(account01);
    const signer2 = await ethers.getSigner(account02);    
    
    var adminAddress = await amoCoin.adminAddress();
    var newAdminAddress = account02;

    var _signer = signer1;
    if (adminAddress == account02) {
      newAdminAddress = account01;
      var _signer = signer2;      
    }

    const oldAdminAddress = await amoCoin.adminAddress();
    await expect(
      amoCoin.connect(_signer).changeAdmin(oldAdminAddress)
    ).to.be.revertedWith('onlyValidDestination');


    await expect(
      amoCoin.connect(_signer).changeAdmin('0x0000000000000000000000000000000000000000')
    ).to.be.revertedWith('onlyValidDestination');

    await amoCoin.connect(_signer).changeAdmin(newAdminAddress);
    const newAdminAddress2 = await amoCoin.adminAddress();    
    expect(oldAdminAddress == newAdminAddress2).to.equal(false);
    expect(newAdminAddress).to.equal(newAdminAddress2);

    var adminBalance1 = await amoCoin.balanceOf(oldAdminAddress);
    var adminBalance2 = await amoCoin.balanceOf(newAdminAddress);  
    var totalSupply  = await amoCoin.totalSupply();

    expect(adminBalance1).to.equal(BigInt('0'));
    expect(adminBalance2).to.equal(totalSupply);    
  });
});

describe('transfer/transferFrom 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('transfer / transferFrom 테스트', async function () {
    const signer = await ethers.getSigners();
    const targetAddress1 = signer[2].address;    
    const targetSigner1 = await ethers.getSigner(targetAddress1);   
    const targetAddress2 = signer[3].address;    

    var adminAddress = await amoCoin.adminAddress();
    var adminSigner = await ethers.getSigner(adminAddress);    

    await amoCoin.connect(adminSigner).enableTransfer();
    var transferEnabled = await amoCoin.transferEnabled();
    expect(transferEnabled).to.equal(true);

    var adminBalance1 = await amoCoin.balanceOf(adminAddress);
    var targetBalance1 = await amoCoin.balanceOf(targetAddress1);

    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('10000000000000000000000'));

    var adminBalance2 = await amoCoin.balanceOf(adminAddress);
    var targetBalance2 = await amoCoin.balanceOf(targetAddress1);    
    var targetBalance2_1 = await amoCoin.balanceOf(targetAddress2);

    expect(adminBalance2).to.equal(adminBalance1.sub('10000000000000000000000'));
    expect(targetBalance2).to.equal(targetBalance1.add('10000000000000000000000'));    

    await amoCoin.connect(targetSigner1).transfer(targetAddress2, BigInt('10000000000000000000000'));  
    
    var targetBalance3 = await amoCoin.balanceOf(targetAddress1);    
    var targetBalance3_1 = await amoCoin.balanceOf(targetAddress2);

    expect(targetBalance3).to.equal(targetBalance2.sub('10000000000000000000000'));        
    expect(targetBalance3_1).to.equal(targetBalance2_1.add('10000000000000000000000'));
  });
});

describe('enable/disable Transfer', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('enableTransfer / disableTransfer 테스트', async function () {
    const signer = await ethers.getSigners();
    const targetAddress1 = signer[2].address;
    const targetSigner1 = await ethers.getSigner(targetAddress1);   
    const targetAddress2 = signer[3].address;    
    const targetSigner2 = await ethers.getSigner(targetAddress2);
    const targetAddress3 = signer[4].address;

    const adminAddress = await amoCoin.adminAddress();
    const adminSigner = await ethers.getSigner(adminAddress);    
    await amoCoin.connect(adminSigner).enableTransfer();

    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('10000000000000000000000'));
    const balanceTarget1_1 = await amoCoin.balanceOf(targetAddress1);
    const balanceTarget1_2 = await amoCoin.balanceOf(targetAddress2);    

    await amoCoin.connect(targetSigner1).transfer(targetAddress2, BigInt('1000000000000000000'));
    const balanceTarget2_1 = await amoCoin.balanceOf(targetAddress1);
    const balanceTarget2_2 = await amoCoin.balanceOf(targetAddress2);

    expect(balanceTarget2_1).to.equal(balanceTarget1_1.sub('1000000000000000000'));
    expect(balanceTarget2_2).to.equal(balanceTarget1_2.add('1000000000000000000'));    

    await amoCoin.connect(adminSigner).disableTransfer();    

    await expect(
      amoCoin.connect(targetSigner1).transfer(targetAddress2, BigInt('1000000000000000000'))
    ).to.be.revertedWith('onlyWhenTransferAllowed');

    await amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('5000000000000000000'));

    const allowanceTest = await amoCoin.allowance(targetAddress1, targetAddress2);

    await expect(
      amoCoin.connect(targetSigner2).transferFrom(targetAddress1, targetAddress3, BigInt('50000000000000000'))
    ).to.be.revertedWith('onlyWhenTransferAllowed');
  });  
});


describe('burn 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('burn 테스트', async function () {
    const signer = await ethers.getSigners();

    const targetAddress1 = signer[1].address;
    const targetSigner1 = await ethers.getSigner(targetAddress1);   

    const adminAddress = await amoCoin.adminAddress();
    const adminSigner = await ethers.getSigner(adminAddress);    

    const totalSupply1 = await amoCoin.totalSupply();

    await amoCoin.connect(adminSigner).burn(BigInt('50000000000000000'));

    const totalSupply2 = await amoCoin.totalSupply();
    expect(totalSupply2).to.equal(totalSupply1.sub('50000000000000000'));

    await expect(
      amoCoin.connect(adminSigner).burn(totalSupply2.add(BigInt('50000000000000000')))
    ).to.be.revertedWith('burn amount exceeds balance');

    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('500000000000000000000'));

    await expect(
      amoCoin.connect(targetAddress1).burn(BigInt('500000000000000000000'))
    ).to.be.revertedWith('onlyAdmin');
  });
});


describe('approve/allowance 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('approve/allowance 테스트', async function () {
    const signer = await ethers.getSigners();

    const targetAddress1 = signer[1].address;
    const targetSigner1 = await ethers.getSigner(targetAddress1);   

    const targetAddress2 = signer[2].address;
    const targetSigner2 = await ethers.getSigner(targetAddress2);   

    const targetAddress3 = signer[3].address;

    const adminAddress = await amoCoin.adminAddress();
    const adminSigner = await ethers.getSigner(adminAddress);

    await amoCoin.connect(adminSigner).enableTransfer();

    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('1000000000000000000000'));

    await expect(
      amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('100000000000000000000000'))
    ).to.be.revertedWith('amount is too big');

    await amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('50000000000000000000'));
    const allowance = await amoCoin.allowance(targetAddress1, targetAddress2);
    expect(allowance).to.equal(BigInt('50000000000000000000'));

    await expect(
      amoCoin.connect(targetSigner2).transferFrom(targetAddress1, targetAddress3, BigInt('150000000000000000000'))
    ).to.be.revertedWith('insufficient allowance');

    await amoCoin.connect(targetSigner2).transferFrom(targetAddress1, targetAddress3, BigInt('50000000000000000000'));

    const balance1 = await amoCoin.balanceOf(targetAddress1);
    const balance3 = await amoCoin.balanceOf(targetAddress3);

    expect(balance1).to.equal(BigInt('950000000000000000000'));
    expect(balance3).to.equal(BigInt('50000000000000000000'));
  });
});


describe('increaseAllowance/decreaseAllowance 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('increaseAllowance/decreaseAllowance 테스트', async function () {
    const signer = await ethers.getSigners();

    const targetAddress1 = signer[1].address;
    const targetSigner1 = await ethers.getSigner(targetAddress1);   

    const targetAddress2 = signer[2].address;
    const targetSigner2 = await ethers.getSigner(targetAddress2);   

    const targetAddress3 = signer[3].address;

    const adminAddress = await amoCoin.adminAddress();
    const adminSigner = await ethers.getSigner(adminAddress);

    await amoCoin.connect(adminSigner).enableTransfer();

    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('1000000000000000000000'));
    await amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('50000000000000000000'));
    const allowance1 = await amoCoin.allowance(targetAddress1, targetAddress2);
    expect(allowance1).to.equal(BigInt('50000000000000000000'));

    await expect(
      amoCoin.connect(targetSigner1).decreaseAllowance(targetAddress2, BigInt('80000000000000000000'))
    ).to.be.revertedWith('decreased allowance below zero');


    await amoCoin.connect(targetSigner1).increaseAllowance(targetAddress2, BigInt('20000000000000000000'));
    const allowance2 = await amoCoin.allowance(targetAddress1, targetAddress2);    
    expect(allowance2).to.equal(BigInt('70000000000000000000'));
    const balance1 = await amoCoin.balanceOf(targetAddress1);
    //await amoCoin.connect(targetSigner1).increaseAllowance(targetAddress2, balance1.add(BigInt('20000000000000000000')));

    await expect(
      amoCoin.connect(targetSigner1).increaseAllowance(targetAddress2, balance1.add(BigInt('20000000000000000000')))
    ).to.be.revertedWith('amount is too big');
  });
});


describe('lockAccount/unlockAccount 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('lockAccount/unlockAccount 테스트', async function () {
    const signer = await ethers.getSigners();

    const targetAddress1 = signer[1].address;
    const targetSigner1 = await ethers.getSigner(targetAddress1);   

    const targetAddress2 = signer[2].address;
    const targetSigner2 = await ethers.getSigner(targetAddress2);   

    const targetAddress3 = signer[3].address;

    const adminAddress = await amoCoin.adminAddress();
    const adminSigner = await ethers.getSigner(adminAddress);

    await amoCoin.connect(adminSigner).enableTransfer();
    await amoCoin.connect(adminSigner).transfer(targetAddress1, BigInt('1000000000000000000000'));
    await amoCoin.connect(adminSigner).lockAccount(targetAddress1, BigInt('1000000000000000000000'));

    await expect(
      amoCoin.connect(targetSigner1).transfer(targetAddress2, BigInt('1000000000000000000000'))
    ).to.be.revertedWith('onlyAllowedAmount #2');

    await amoCoin.connect(adminSigner).unlockAccount(targetAddress1);

    amoCoin.connect(targetSigner1).transfer(targetAddress2, BigInt('1000000000000000000000'))
  });
});


describe('safeTransfer / safeTransferFrom 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });

  it('safeTransfer / safeTransferFrom 테스트', async function () {
    const signer = await ethers.getSigners();
    const targetAddress1 = signer[2].address;    
    const targetSigner1 = await ethers.getSigner(targetAddress1);   
    const targetAddress2 = signer[3].address;    
    const targetSigner2 = await ethers.getSigner(targetAddress2);
    const targetAddress3 = signer[4].address;        

    var adminAddress = await amoCoin.adminAddress();
    var adminSigner = await ethers.getSigner(adminAddress);    

    await amoCoin.connect(adminSigner).enableTransfer();
    var transferEnabled = await amoCoin.transferEnabled();
    expect(transferEnabled).to.equal(true);

    var adminBalance1 = await amoCoin.balanceOf(adminAddress);
    var targetBalance11 = await amoCoin.balanceOf(targetAddress1);

    await amoCoin.connect(adminSigner)["safeTransfer(address,uint256)"](targetAddress1, BigInt('10000000000000000000000'))

    var adminBalance2 = await amoCoin.balanceOf(adminAddress);    
    var targetBalance21 = await amoCoin.balanceOf(targetAddress1);

    expect(adminBalance2).to.equal(adminBalance1.sub(BigInt('10000000000000000000000')));
    expect(targetBalance21).to.equal(BigInt('10000000000000000000000'));

    await amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('10000000000000000000000'));
    await amoCoin.connect(targetSigner2)["safeTransferFrom(address,address,uint256)"](targetAddress1, targetAddress3, BigInt('10000000000000000000000'))    
    
    var targetBalance31 = await amoCoin.balanceOf(targetAddress1);    
    var targetBalance33 = await amoCoin.balanceOf(targetAddress3);

    expect(targetBalance31).to.equal(BigInt('0'));
    expect(targetBalance33).to.equal(BigInt('10000000000000000000000'));
  });
});

describe('safeTransfer / safeTransferFrom 테스트 - #2', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });  
  it('safeTransfer / safeTransferFrom 테스트 - #2', async function () {
    const signer = await ethers.getSigners();
    const targetAddress1 = signer[2].address;    
    const targetSigner1 = await ethers.getSigner(targetAddress1);   
    const targetAddress2 = signer[3].address;    
    const targetSigner2 = await ethers.getSigner(targetAddress2);
    const targetAddress3 = signer[4].address;        

    var adminAddress = await amoCoin.adminAddress();
    var adminSigner = await ethers.getSigner(adminAddress);    

    await amoCoin.connect(adminSigner).enableTransfer();
    var transferEnabled = await amoCoin.transferEnabled();
    expect(transferEnabled).to.equal(true);

    var adminBalance1 = await amoCoin.balanceOf(adminAddress);
    var targetBalance11 = await amoCoin.balanceOf(targetAddress1);

    var data = '';
    const encoder = new TextEncoder();
    var dataBytes = encoder.encode(data);

    await amoCoin.connect(adminSigner)["safeTransfer(address,uint256,bytes)"](targetAddress1, BigInt('10000000000000000000000'), dataBytes);
    var adminBalance2 = await amoCoin.balanceOf(adminAddress);    
    var targetBalance21 = await amoCoin.balanceOf(targetAddress1);

    expect(adminBalance2).to.equal(adminBalance1.sub(BigInt('10000000000000000000000')));
    expect(targetBalance21).to.equal(BigInt('10000000000000000000000'));

    await amoCoin.connect(targetSigner1).approve(targetAddress2, BigInt('10000000000000000000000'));
    await amoCoin.connect(targetSigner2)["safeTransferFrom(address,address,uint256,bytes)"](targetAddress1, targetAddress3, BigInt('10000000000000000000000'), dataBytes)    
    
    var targetBalance31 = await amoCoin.balanceOf(targetAddress1);    
    var targetBalance33 = await amoCoin.balanceOf(targetAddress3);

    expect(targetBalance31).to.equal(BigInt('0'));
    expect(targetBalance33).to.equal(BigInt('10000000000000000000000'));
  });  
});


describe('supporsInterface 테스트', function () {
  before(async function () {
//    amoCoin = (await ethers.getContractAt(
//      'AmoCoin',
//      deployedContract
//    )) as AmoCoin;
    const AmoCoin = await ethers.getContractFactory('AmoCoin');
    const amoCoin_ = await AmoCoin.deploy();
    await amoCoin_.deployed();
    amoCoin = amoCoin_;
    deployedContract = amoCoin.address;
  });  
  it('supporsInterface', async function () {
    const signer = await ethers.getSigners();
    var adminAddress = await amoCoin.adminAddress();
    var adminSigner = await ethers.getSigner(adminAddress);    

    const supportIKIP7 = await amoCoin.supportsInterface('0x65787371');  // IKIP7
    const supportIKIP7TokenReceiver = await amoCoin.supportsInterface('0x9d188c22');  // IKIP7TokenReceiver
    const supportIKIP7Metadata = await amoCoin.supportsInterface('0xa219a025');  // IKIP7Metadata    
    const supportIKIP7Mintable = await amoCoin.supportsInterface('0xeab83e20');  // IKIP7Mintable    
    const supportIKIP7Burnable = await amoCoin.supportsInterface('0x3b5a0bf8');  // IKIP7Burnable    
    const supportIKIP7Pausable = await amoCoin.supportsInterface('0x4d5507ff');  // IKIP7Pausable                

    console.log("supportIKIP7 :", supportIKIP7);
    console.log("supportIKIP7TokenReceiver :", supportIKIP7TokenReceiver);
    console.log("supportIKIP7Metadata :", supportIKIP7Metadata);
    console.log("supportIKIP7Mintable :", supportIKIP7Mintable);
    console.log("supportIKIP7Burnable :", supportIKIP7Burnable);
    console.log("supportIKIP7Pausable :", supportIKIP7Pausable);                   

    expect(supportIKIP7).to.equal(true);
    expect(supportIKIP7TokenReceiver).to.equal(false);
    expect(supportIKIP7Metadata).to.equal(true);
    expect(supportIKIP7Mintable).to.equal(false);
    expect(supportIKIP7Burnable).to.equal(false);
    expect(supportIKIP7Pausable).to.equal(false);
  });  
});