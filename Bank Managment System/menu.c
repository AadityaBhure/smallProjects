    #include <stdio.h>
    #include <stdlib.h>

    void depositFunc(int *userBalance);
    void withdrawFunc(int *userBalance);
    void fdFunc(int *userBalance);
    void fdCreateFunc(int *userBalance);
    void fdCalculateFunc(int *userBalance);
    void paymentFunc(int *userBalance);
    
    struct fdCreateData
    {
        int fdAmount;
        int fdTime;
        int fdCounter;
    }fdData[10];    

    int main2()
    {   
        int userCommand;
        int userBalance=0;
        while(1)
        {
        
        //Menu

        printf("\n===BlueRay Bank===\n\n<-Menu->            Balance: %d\n\n",userBalance);
        printf("1: Deposit\n2: Withdraw\n3: Payment\n4: Fixed Deposit\n5: Logout\n: ");
        scanf("%d",&userCommand);
        printf("\n");

        while(userCommand<1 || userCommand>6)
        {
            printf("Invalid Input!\n");
            printf("                    Balance: %d\n",userBalance);
            printf("1: Deposit\n2: Withdraw\n3: Payment\n4: Fixed Deposit\n5: Logout\n: ");
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
            paymentFunc(&userBalance);
            break;
        case 4:
            fdFunc(&userBalance);
            break;
        case 5:
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

        printf("1: Create FD\n2: FD Calculator\n3: Back\n: ");
        scanf("%d",&userInput);

        switch (userInput)
        {
        case 1:
            fdCreateFunc(userBalance);
            break;
        case 2:
            fdCalculateFunc(userBalance);
            break;
        case 3:
            break;
        default:
            printf("Invalid Input");
            break;
        }

    }

    void fdCalculateFunc(int *userBalance)
    {   
        int amount,interest,time,fd,globalFd;
        printf("Fixed Deposit Calculator\n");

        printf("Enter Amount: ");
        scanf("%d",&amount);

        printf("Enter Interest: ");
        scanf("%d",&interest);

        printf("Enter Time(in years): ");
        scanf("%d",&time);

        fd = amount * (1 + (interest / 100.0) * time);

        globalFd = fd + *userBalance;

        printf("\nPrincipal Amount: %d",amount);
        printf("\nAdded Amount after Maturity: %d",fd-amount);
        printf("\nAmount on Maturity = %d",fd);
        printf("\nAmount on Maturity with current Balance = %d\n",globalFd);

    }

    void fdCreateFunc(int *userBalance)
    {   
        int i;
        int fdn;
        int oldBalance = *userBalance;
        printf("\nFixed Deposit - Create:\n");
        printf("\nInterest Rate is fixed at: 7");

        printf("\nHow many FDs you want to open\nEnter -1 to exit\n: ");
        scanf("%d",&fdn);
        if(fdn == -1)
        {
            printf("Returning to Menu");
        }
        else if(fdn < -1)
        {
            printf("Invalid Input");
        }
        else
        {
            for(i=0;i<fdn;i++)
            {
                printf("\nEnter Amount: ");
                scanf("%d",&fdData[i].fdAmount);
                if(*userBalance < 0)
                {
                    printf("Insufficient Funds");
                    break;
                }
                else
                {
                    *userBalance -= fdData[i].fdAmount;
                    if(*userBalance < 0)
                    {
                        printf("Insufficient Funds\n");
                        *userBalance = oldBalance;
                        break;
                    }
                }
                

                printf("Enter Duration: ");
                scanf("%d",&fdData[i].fdTime);
                fdData[i].fdCounter = 1;
            }
        }
    }

    void paymentFunc(int *userBalance)
    {   
        int l;
        int userChoice;
        int reciveBankId,amount,oldBalance;
        printf("Payment Portal\n");

        do
        {
            printf("1: Proceed\n2: Return\n: ");
            scanf("%d",&userChoice);
            if(userChoice == 1)
            {
                l = 1;
            }
            else if(userChoice == 2)
            {
                l = 1;
            }
            else
            {
                l = 0;
            }
        } while (l = 0);
        if(userChoice == 2)
        {
            printf("Return to Main Page\n");
        } 
        else
        {   
            printf("Enter recipient Banking Id\n[10 Digit]: ");
            scanf("%d",&reciveBankId);
           
            do
            {
                printf("Enter Amount: ");
                scanf("%d",&amount);
            } while (amount < 0);
            
            
            oldBalance = *userBalance - amount;
            if(oldBalance < 0)
            {
                printf("Insufficient Balance");
            }
            else
            {
                printf("Transaction Successful\n");
                *userBalance -= amount;    
            }    
        }
        
    }