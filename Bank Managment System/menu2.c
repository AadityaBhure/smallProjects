    #include <stdio.h>

    void depositFunc(int *userBalance);
    void withdrawFunc(int *userBalance);
    void fdFunc(int *userBalance);
    //void fdCreateFunc(int *userBalance);
    void fdCalculateFunc(int *userBalance);

    int main2()
    {   
        int userCommand;
        int userBalance=0;
        while(1)
        {
        
        //Menu

        printf("\n===BlueRay Bank===\n\n<-Menu->            Balance: %d\n\n",userBalance);
        printf("1: Deposit\n2: Withdraw\n3: Payment\n4: Fixed Deposit\n5: Loan\n6: Logout\n: ");
        scanf("%d",&userCommand);
        printf("\n");

        while(userCommand<1 || userCommand>6)
        {
            printf("Invalid Input!\n");
            printf("                    Balance: %d\n",userBalance);
            printf("1: Deposit\n2: Withdraw\n3: Payment\n4: Fixed Deposit\n5: Loan\n6: Logout\n: ");
            scanf("%d",&userCommand);
        }

        switch (userCommand)
        {
        case 1:
            depositFunc(&userBalance);
            break;
        case 2:
            withdrawFunc(&userBalance);
            break;
        case 3:
            //paymentFunc();
            break;
        case 4:
            fdFunc(&userBalance);
            break;
        case 5:
            //loanFunc();
            break;
        case 6:
            printf("Thank You");
            abort();
            break;
        default:
            break;
        }   
        } 
    }

    void depositFunc(int *userBalance)
    {   
        int addBalance;
        int oldBalance = *userBalance;
        printf("Deposit Section\n");

        do
        {
            printf("Amount to Deposit: ");
            scanf("%d",&addBalance);
            *userBalance += addBalance;
            if(addBalance < 0)
            {
                printf("Deposit Amount cannot be less than 0\n\n");
                *userBalance = oldBalance;
            }
        } while (*userBalance <= 0);
        
        printf("Added Balance: %d\n",addBalance);
        printf("Current Balance: %d\n",*userBalance);
    }

    void withdrawFunc(int *userBalance)
    {
        int removeBalance;
        int oldBalance = *userBalance;
        printf("Withdraw Section\n");

        do
        {
            printf("Amount to Withdraw: ");
            scanf("%d",&removeBalance);
            *userBalance -= removeBalance;

            if(removeBalance < 0)
            {
                printf("Deposit Amount cannot be less than 0\n\n");
                *userBalance = oldBalance;
            }
            else if(*userBalance < 0)
            {
                printf("Insufficient Funds\n");
                *userBalance = oldBalance;
                break;
            }
        } while (*userBalance < 0);
        
        
        printf("Remove Balance: %d\n",removeBalance);
        printf("Current Balance: %d\n",*userBalance);
    }

    void fdFunc(int *userBalance)
    {   
        int userInput;
        printf("Fixed Deposit Section\n");

        printf("1: Create FD\n2: Break FD\n3: FD Calculator\n4: Back\n: ");
        scanf("%d",&userInput);

        switch (userInput)
        {
        case 1:
            //fdCreateFunc(&userBalance);
            break;
        case 2:
            //fdBreakFunc();
            break;
        case 3:
            fdCalculateFunc(userBalance);
            break;
        case 4:
            break;
        default:
            printf("Invalid Input");
            break;
        }

    }

    void fdCalculateFunc(int *userBalance)
    {   
        int amount,interest,time,fd,globalFd,localFd;
        printf("Fixed Deposit Calculator\n");

        printf("Enter Amount: ");
        scanf("%d",&amount);

        printf("Enter Interest: ");
        scanf("%d",&interest);

        printf("Enter Time(in years): ");
        scanf("%d",&time);

        fd = amount * (1 + (interest / 100.0) * time);

        globalFd = fd + *userBalance;
        localFd = fd + amount;

        printf("\nPrincipal Amount: %d",amount);
        printf("\nAdded Amount after Maturity: %d",fd);
        printf("\nAmount on Maturity = %d",localFd);
        printf("\nAmount on Maturity with current Balance = %d\n",localFd);

    }